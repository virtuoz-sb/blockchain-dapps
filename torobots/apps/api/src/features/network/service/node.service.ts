import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { NodeDto } from '../dto/node.dto';
import { mongoDB, INodeDocument } from "@torobot/shared";

@Injectable()
export class NodeService {
  constructor() {}
  async create(node: NodeDto) {
    const object = await mongoDB.Nodes.create(node);
    return this.getById(object._id);
  }

  async update(node: INodeDocument, body: UpdateQuery<INodeDocument>) {
    await mongoDB.Nodes.findOneAndUpdate({ _id: node._id }, body);
    return this.getById(node._id);
  }

  delete(node: INodeDocument) {
    return mongoDB.Nodes.findOneAndDelete({ _id: node._id });
  }

  async getById(nodeId: string) {
    const doc = await mongoDB.Nodes.populateModel(mongoDB.Nodes.findById(nodeId));
    return doc as INodeDocument;
  }

  async validate(nodeId: string) {
    const doc = await this.getById(nodeId);

    if (!doc) {
      throw new NotFoundException('Node not found');
    }

    return doc;
  }

  getAll() {
    return mongoDB.Nodes.populateModel(mongoDB.Nodes.find({}));
  }
}