import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config';

/**
 * Interface for Task attributes
 */
export interface ITaskAttributes {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Task creation attributes
 * Makes id, createdAt, and updatedAt optional during creation
 */
export interface ITaskCreationAttributes extends Optional<ITaskAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Task Model Class
 * Represents a task in the database
 */
export class Task extends Model<ITaskAttributes, ITaskCreationAttributes> implements ITaskAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public completed!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize the Task model
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    modelName: 'Task',
    timestamps: true,
    underscored: true,
  }
);