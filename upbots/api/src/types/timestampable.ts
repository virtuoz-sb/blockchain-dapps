/**
 * for mongoose model having  timestamps: true
 * See {mongoose.SchemaOptions}
 */
export default interface Timestampable {
  createdAt?: Date;
  updatedAt?: Date;
}
