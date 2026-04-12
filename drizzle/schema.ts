import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";
/// Tables
export const projects = mysqlTable("projects", {
  id: int().primaryKey().autoincrement(),
  createdBy: varchar(255),
  createdDate: timestamp().defaultNow(),
  description: text(),
  projectName: varchar(255),
  descriptionHtml: text(),
  address: varchar(1024),
  houseProject: boolean().default(false),
  substrate: boolean().default(false),
  substrateCost: float().default(0),
  floors: int().default(1),
  pricePerSqFt: float(),
  specialChrarges: text(),
  color: varchar(1024),
  landuse: mysqlEnum("landuse", ["Residential", "Commercial"]),
  renovation: boolean().default(false),
  renovationCost: float().default(0),
  builtArea: float().default(0),
  lastUpdated: timestamp().defaultNow().onUpdateNow(),
  taxBand: varchar(255),
  placeId: int(),
  components: json(),
});

export const items = mysqlTable("all_items", {
  id: int().primaryKey().autoincrement(),
  projectId: int(),
  projectId: int(),
  category: varchar(1024),
  itemName: varchar(1024),
  itemType: varchar(1024),
  costPerUnit: float(),
  unitAbbr: varchar(1024),
  quantity: float(),
  subtotal: float(),
  notes: varchar(1024),
  operatorDiscount: float().default(0),
  listItem: varchar(255),
  status: varchar(255),
  conditional: boolean().default(false),
  estimateId: int(),
});

export const stadiumProjects = mysqlTable("stadium_projects", {
  id: int().primaryKey().autoincrement(),
  createdBy: varchar(255),
  createdDate: timestamp().defaultNow(),
  description: text(),
  projectName: varchar(255),
  descriptionHtml: text(),
  address: varchar(1024),
  houseProject: boolean().default(false),
  substrate: boolean().default(false),
  substrateCost: float().default(0),
  floors: int().default(1),
  specialCharges: text(),
  color: varchar(1024),
  landuse: mysqlEnum("landuse", ["Residential", "Commercial"]),
  renovation: boolean().default(false),
  renovationCost: float().default(0),
  builtArea: float().default(0),
  taxBand: varchar(255),
  placeId: int(),
  pricePerSqFt: float(),
  descriptionId: int(),
  trace: json(),
  components: text(),
});

export const estimates = mysqlTable("estimates", {
  id: int().primaryKey().autoincrement(),
  projectId: int(),
  dateCreated: timestamp().defaultNow(),
  status: varchar(1024),
  name: varchar(1024),
});

export const kitchenEstimates = mysqlTable("kitchen_estimates", {
  id: int().primaryKey().autoincrement(),
  projectId: int(),
  dateCreated: timestamp().defaultNow(),
  status: varchar(1024),
  name: varchar(1024),
});

export const jacazzi Projects = mysqlTable('jacazzi_projects', {
  id: int().primaryKey().autoincrement(),
  name: varchar(255),
  projectId: int(),
  operatorDiscount: float().default(0),
  subcontractor: varchar(1024),
  operators.json(),
});

export const users = mysqlTable("users", {
  id: int().primaryKey().autoincrement(),
  email: varchar(255).unique(),
  name: varchar(1024),
  passwordHash: varchar(255),
  role: mysqlEnum("role", ["ADMIN", "OPERATOR", "GUEST"]).
  salt: varchar(255),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
  deletedAt: timestamp(),
});

export const agents = mysqlTable("agents", {
  id: int().primaryKey().autoincrement(),
  firstName: varchar(255),
  lastName: varchar(255),
  pto: varchar(1024),
  operatorId: int(),
  phone: varchar(255),
  email: varchar(255),
  dateCreated: timestamp().defaultNow(),
  dateDeleted: timestamp(),
});

export const tradepeople = mysqlTable("tradepeople", {
  id: int().primaryKey().autoincrement(),
  fname: varchar(255),
  lname: varchar(255),
  pon: varchar(1024),
  operatorId: int(),
  phone: varchar(255),
  email: varchar(255),
  dateCreated: timestamp().defaultNow(),
  dateDeleted: timestamp(),
  supplierId: int(),
  spsrid: int(),
});

export const suppliers = mysqlTable("suppliers", {
  id: int().primaryKey().autoincrement(),
  figureId: int(),
  name: varchar(255),
  phone: varchar(255),
  email: varchar(255),
  address: varchar(1024),
  city: varchar(1024),
  state: varchar(1024),
  country: varchar(255),
  dateCreated: timestamp().defaultNow(),
  dateDeleted: timestamp(),
});

export const operators = mysqlTable("operators", {
  id: int().primaryKey().autoincrement(),
  name: varchar(255),
  operatorListId: int(),
  phone: varchar(255),
  email: varchar(255),
  dateCreated: timestamp().defaultNow(),
  dateDeleted: timestamp(),
});

