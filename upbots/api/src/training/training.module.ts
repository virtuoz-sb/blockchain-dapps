import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import TrainingController from "./training.controller";
import { LevelSchema, Level } from "./models/level.schema";
import { FormatSchema, Format } from "./models/format.schema";
import { TopicSchema, Topic } from "./models/topic.schema";
import { LanguageSchema, Language } from "./models/language.schema";
import { TrainingSchema, Training } from "./models/training.schema";
import { Enroll, EnrollSchema } from "./models/enroll.schema";
import TrainingService from "./training.service";

@Module({
  controllers: [TrainingController],
  imports: [
    MongooseModule.forFeature([{ name: Level.name, schema: LevelSchema }]),
    MongooseModule.forFeature([{ name: Format.name, schema: FormatSchema }]),
    MongooseModule.forFeature([{ name: Language.name, schema: LanguageSchema }]),
    MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
    MongooseModule.forFeature([{ name: Language.name, schema: LanguageSchema }]),
    MongooseModule.forFeature([{ name: Training.name, schema: TrainingSchema }]),
    MongooseModule.forFeature([{ name: Enroll.name, schema: EnrollSchema }]),
  ],
  providers: [TrainingService],
})
export default class TraingModule {}
