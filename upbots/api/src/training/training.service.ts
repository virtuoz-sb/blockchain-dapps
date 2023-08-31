/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { plainToClass } from "class-transformer";
import { Level, LevelDTO } from "./models/level.schema";
import { Topic, TopicDTO } from "./models/topic.schema";
import { Language, LanguageDTO } from "./models/language.schema";
import { Format, FormatDTO } from "./models/format.schema";
import { Training, TrainingDTO } from "./models/training.schema";
import { Enroll } from "./models/enroll.schema";

@Injectable()
export default class TrainingService {
  constructor(
    @InjectModel(Level.name) private LevelModel: Model<Level>,
    @InjectModel(Topic.name) private TopicModel: Model<Topic>,
    @InjectModel(Language.name) private LanguageModel: Model<Language>,
    @InjectModel(Format.name) private FormatModel: Model<Format>,
    @InjectModel(Training.name) private TrainingModel: Model<Training>,
    @InjectModel(Enroll.name) private EnrollModel: Model<Enroll>
  ) {}

  async getLevels(): Promise<LevelDTO[]> {
    const levels = await this.LevelModel.find();
    return levels.map((l) => plainToClass(LevelDTO, l));
  }

  async getTopics(): Promise<TopicDTO[]> {
    const topics = await this.TopicModel.find();
    return topics.map((l) => plainToClass(TopicDTO, l));
  }

  async getFormats(): Promise<FormatDTO[]> {
    const formats = await this.FormatModel.find();
    return formats.map((l) => plainToClass(FormatDTO, l));
  }

  async getLanguages(): Promise<LanguageDTO[]> {
    const languages = await this.LanguageModel.find();
    return languages.map((l) => plainToClass(LanguageDTO, l));
  }

  async getTrainings({
    limit = 1,
    offset = 0,
    search = null,
    topic = null,
    level = null,
    format = null,
    lang = null,
  }): Promise<TrainingDTO[]> {
    const where: { [k: string]: any } = {};
    if (topic) {
      where.topic = topic;
    }
    if (level) {
      where.level = level;
    }
    if (lang) {
      where.lang = lang;
    }
    if (format) {
      where.format = format;
    }
    if (search) {
      where.$text = {
        $search: search,
        $caseSensitive: false,
      };
    }
    const trainings = await this.TrainingModel.find(where, null, {
      sort: {
        createdAt: -1,
      },
      skip: offset,
      limit,
    });
    const result = trainings.map((l) => {
      const p = plainToClass(TrainingDTO, l);
      p.ratings = 123;
      p.rating = 4.5;
      return p;
    });
    return result;
  }

  async seed() {
    const levels = ["Beginner", "Intermediate"];
    const topics = ["BTC", "Crytpo"];
    const languages = ["ENG", "UA"];
    const formats = ["Video", "Text"];

    const trainings = [
      {
        title: "Title 1",
        description: "decsssda 1",
        coverImage: "https://cdn.eso.org/images/screen/eso1322a.jpg",
        keywords: ["crypto", "blockchain"],
        price: 100,
      },
      {
        title: "Title 2",
        description: "decsssda 2",
        coverImage: "https://cdn.eso.org/images/screen/eso1322a.jpg",
        keywords: ["crypto", "blockchain"],
        price: 800,
      },
      {
        title: "Title 3",
        description: "decsssda 9",
        coverImage: "https://cdn.eso.org/images/screen/eso1322a.jpg",
        keywords: ["crypto", "blockchain"],
        price: 30,
      },
      {
        title: "Title 4",
        description: "decsssda 8",
        coverImage: "https://cdn.eso.org/images/screen/eso1322a.jpg",
        keywords: ["crypto", "blockchain"],
        price: 20,
      },
      {
        title: "Title 5",
        description: "search",
        coverImage: "https://cdn.eso.org/images/screen/eso1322a.jpg",
        keywords: ["crypto", "blockchain"],
        price: 200,
      },
    ];

    await this.LevelModel.deleteMany({});
    await this.TopicModel.deleteMany({});
    await this.LanguageModel.deleteMany({});
    await this.FormatModel.deleteMany({});
    await this.TrainingModel.deleteMany({});

    for (const c of levels) {
      await this.LevelModel.create({
        name: c,
      });
    }

    for (const c of topics) {
      await this.TopicModel.create({
        name: c,
      });
    }

    for (const c of languages) {
      await this.LanguageModel.create({
        name: c,
      });
    }

    for (const c of formats) {
      await this.FormatModel.create({
        name: c,
      });
    }

    for (const t of trainings) {
      const [topic] = await this.TopicModel.aggregate([{ $sample: { size: 1 } }]);
      const [language] = await this.LanguageModel.aggregate([{ $sample: { size: 1 } }]);
      const [level] = await this.LevelModel.aggregate([{ $sample: { size: 1 } }]);
      const [format] = await this.FormatModel.aggregate([{ $sample: { size: 1 } }]);

      await this.TrainingModel.create({
        title: t.title,
        description: t.description,
        coverImage: t.coverImage,
        keywords: t.keywords,
        price: t.price,
        lang: language,
        topic,
        level,
        format,
        createdAt: new Date(),
      });
    }
  }
}
