import express, { Express, response } from "express";
import { respond } from "@torobot/shared";
import { 
  triggerBot, triggerLiquidatorBot, triggerVolumeBot, triggerAutoBot, 
  withdrawAutoBotSubWallet, AutoBotSubWalletInfo, triggerWasherBot, withdrawWasherBotSubWallet, 
  createToken, mintToken, burnToken, addLP, removeLP
} from "../bot";


export const initRoutes = (app: Express) => {
  app.post("/bot/trigger", async (req, res) => {
    const payload = req.body;
    let response = {};

    try {
      const result = await triggerBot(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/liquidatorbot/trigger", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await triggerLiquidatorBot(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });
  app.post("/volumebot/trigger", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await triggerVolumeBot(payload.botId, payload.active);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/autobot/trigger", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await triggerAutoBot(payload.botId, payload.active);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/autobot/withdraw", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await withdrawAutoBotSubWallet(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/autobot/subwallet", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await AutoBotSubWalletInfo(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/washerbot/trigger", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await triggerWasherBot(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/washerbot/withdraw", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await withdrawWasherBotSubWallet(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/tokencreatorbot/create", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await createToken(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to create bot(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/tokencreatorbot/tokenmint", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await mintToken(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to mint token(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/tokencreatorbot/tokenburn", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await burnToken(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to burn token(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/tokencreatorbot/addlp", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await addLP(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to addlp(${payload.botId})`);
    }
    return res.json(response);
  });

  app.post("/tokencreatorbot/removelp", async (req, res) => {
    const payload = req.body;
    let response = {};
    try {
      const result = await removeLP(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to removelp(${payload.botId})`);
    }
    return res.json(response);
  });

}
