import { Controller, Get, UseGuards, BadRequestException, Logger, Post, Body, Res, Req, HttpStatus, Query } from "@nestjs/common";
import { Response, Request } from "express";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import TrainingService from "./training.service";

@ApiTags("training")
@Controller("training")
export default class TrainingController {
  constructor(private service: TrainingService) {}

  @Get("/")
  @ApiOperation({
    summary: "List of availabale trainings",
  })
  async getAll(@Res() res: Response, @Req() request: Request) {
    let limit = 1;
    if (request.query.limit) {
      limit = parseInt(request.query.limit.toString(), 10);
    }
    let offset = 0;
    if (request.query.offset) {
      offset = parseInt(request.query.offset.toString(), 10);
    }
    const trainings = await this.service.getTrainings({
      limit,
      offset,
      topic: request.query.topic,
      level: request.query.level,
      format: request.query.format,
      lang: request.query.language,
      search: request.query.search,
    });
    res.status(HttpStatus.OK).json({ trainings });
  }

  @Get("/topics")
  async getTopics(@Res() res: Response) {
    const topics = await this.service.getTopics();
    res.status(HttpStatus.OK).json({
      topics,
    });
  }

  @Get("/levels")
  async getLevels(@Res() res: Response) {
    const levels = await this.service.getLevels();
    res.status(HttpStatus.OK).json({
      levels,
    });
  }

  @Get("/formats")
  async getFormats(@Res() res: Response) {
    const formats = await this.service.getFormats();
    res.status(HttpStatus.OK).json({
      formats,
    });
  }

  @Get("/languages")
  async getLanguages(@Res() res: Response) {
    const languages = await this.service.getLanguages();
    res.status(HttpStatus.OK).json({
      languages,
    });
  }

  @Get("/seed")
  async seed(@Res() res: Response) {
    await this.service.seed();
    res.status(HttpStatus.OK).json({
      seed: true,
    });
  }
}
