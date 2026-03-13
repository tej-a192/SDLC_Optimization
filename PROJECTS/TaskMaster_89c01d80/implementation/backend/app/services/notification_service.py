from typing import Optional
from fastapi import HTTPException
from app.models.user import User
from app.models.task import Task
from app.services.auth_service import get_current_user
from app.core.config import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class NotificationService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.sender_email = settings.EMAIL_FROM
        self.sender_password = settings.EMAIL_PASSWORD

    def send_email_notification(self, recipient: User, subject: str, body: str) -> bool:
        """
        Sends an email notification to a user.
        
        Args:
            recipient (User): The user to notify
            subject (str): Email subject line
            body (str): Email body content
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            message = MIMEMultipart()
            message["From"] = self.sender_email
            message["To"] = recipient.email
            message["Subject"] = subject
            
            message.attach(MIMEText(body, "plain"))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            text = message.as_string()
            server.sendmail(self.sender_email, recipient.email, text)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

    def notify_task_assignment(self, task: Task, assignee: User) -> None:
        """
        Notify a user when a task has been assigned to them.
        
        Args:
            task (Task): The task that was assigned
            assignee (User): The user to whom the task was assigned
        """
        subject = f"New Task Assigned: {task.title}"
        body = f"""
        Hello {assignee.email},
        
        A new task has been assigned to you:
        
        Title: {task.title}
        Description: {task.description or 'No description provided'}
        Due Date: {task.due_date or 'Not specified'}
        Priority: {task.priority}/5
        
        Please log in to your dashboard to view the details.
        
        Best regards,
        Task Management Team
        """
        
        self.send_email_notification(assignee, subject, body)

    def notify_task_update(self, task: Task, updater: User, message: Optional[str] = None) -> None:
        """
        Notify relevant users when a task is updated.
        
        Args:
            task (Task): The updated task
            updater (User): The user who made the update
            message (Optional[str]): Additional message about the update
        """
        if not task.owner_id:
            return
            
        # In a real implementation, you would fetch the owner from the database
        # For now we'll assume they should be notified
        subject = f"Task Updated: {task.title}"
        body = f"""
        Hello,
        
        The task "{task.title}" has been updated by {updater.email}.
        
        {message if message else ''}
        
        Please log in to your dashboard to view the changes.
        
        Best regards,
        Task Management Team
        """
        
        # In a complete implementation, we would identify all stakeholders
        # For now, we'll just send to the task owner placeholder
        # owner = get_user_by_id(task.owner_id)
        # if owner:
        #     self.send_email_notification(owner, subject, body)

    def notify_overdue_tasks(self, tasks: list[Task]) -> None:
        """
        Send notifications for overdue tasks.
        
        Args:
            tasks (list[Task]): List of overdue tasks
        """
        for task in tasks:
            if task.owner_id:
                # owner = get_user_by_id(task.owner_id)
                # if owner:
                subject = f"Overdue Task: {task.title}"
                body = f"""
                Hello,
                
                The following task is overdue:
                
                Title: {task.title}
                Description: {task.description or 'No description provided'}
                Due Date: {task.due_date}
                
                Please take action immediately.
                
                Best regards,
                Task Management Team
                """
                # self.send_email_notification(owner, subject, body)