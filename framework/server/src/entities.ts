
// export enum ColumnTypes {
//   INT,
//   FLOAT,
//   VARCHAR,
//   TEXT,
// }

export const RelationTypes = {
  OneToOne: "OneToOne" as const,
  ManyToOne: "ManyToOne" as const,
  OneToMany: "OneToMany" as const,
  ManyToMany: "ManyToMany" as const,
}

// export const GeneratedTypes = {
//   UUID: "UUID" as const,
//   INCREMENT: "INCREMENT" as const,
// }

// export type EntitySchemaColumnOptions = {
//   primary?: boolean
//   default?: string
//   generated?: keyof typeof GeneratedTypes
//   type: string
// }
