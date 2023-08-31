import Vue from "vue";
import Router, { Route } from "vue-router";

const Home = () => import("@/pages/Home.vue");
const Portfolio = () => import("@/pages/Portfolio.vue");
const PortfolioOld = () => import("@/pages/PortfolioOld.vue");
const PortfolioMonitoringSummary = () => import("@/pages/portfolio/PortfolioMonitoringSummary.vue");
const PortfolioMonitoringCEXs = () => import("@/pages/portfolio/PortfolioMonitoringCEXs.vue");
const PortfolioMonitoringETHPortfolio = () => import("@/pages/portfolio/PortfolioMonitoringETHPortfolio.vue");
const MyPerformance = () => import("@/pages/MyPerformance.vue");
const ManualTrade = () => import("@/pages/ManualTrade.vue");
const MyBots = () => import("@/pages/MyBots.vue");
const DevMode = () => import("@/pages/DevMode.vue");
const CreateNewBot = () => import("@/pages/CreateNewBot.vue");
const BotDetail = () => import("@/pages/BotDetail.vue");
const AlgoBots = () => import("@/pages/AlgoBots.vue");
const AlgoBotDetailedNew = () => import("@/pages/AlgoBotDetailedNew.vue");
const SignalProviders = () => import("@/pages/SignalProviders.vue");
const Learning = () => import("@/pages/Learning.vue");
const LearningCourse = () => import("@/pages/LearningCourse.vue");
const CopyTrading = () => import("@/pages/CopyTrading.vue");
const Swap = () => import("@/pages/Swap.vue");
const Staking = () => import("@/pages/Staking.vue");
const UBXTVault = () => import("@/pages/UBXTVault.vue");
const UBXTStaking = () => import("@/pages/UBXTStaking.vue");
const UBXTETHLPStaking = () => import("@/pages/UBXTETHLPStaking.vue");
const UBXTBUSDLPStaking = () => import("@/pages/UBXTBUSDLPStaking.vue");
const UBXTBSCStaking = () => import("@/pages/UBXTBSCStaking.vue");
const UbxtBridge = () => import("@/pages/UbxtBridge.vue");
const Profile = () => import("@/pages/Profile.vue");
const ExchangeKeys = () => import("@/pages/ExchangeKeys.vue");
const BotPerformance = () => import("@/pages/BotPerformance.vue");
const UBXTInfo = () => import("@/pages/UBXTInfo.vue");
const UBXTWallet = () => import("@/pages/UBXTWallet.vue");
const TermsConditions = () => import("@/pages/TermsConditions.vue");
const PrivacyPolicy = () => import("@/pages/PrivacyPolicy.vue");
const ComingSoon = () => import("@/pages/ComingSoon.vue");

const Login = () => import("@/pages/auth/Login.vue");
const Register = () => import("@/pages/auth/Register.vue");
const PasswordReset = () => import("@/pages/auth/PasswordReset.vue");
const PasswordRecover = () => import("@/pages/auth/PasswordRecover.vue");
const AccountActivation = () => import("@/pages/auth/AccountActivation.vue");
const TotpAuthentification = () => import("@/pages/auth/TotpAuthentification.vue");
const Notifications = () => import("@/pages/Notifications.vue");

const Playground = () => import("@/playground/Playground.vue");
const NotFound = () => import("@/pages/NotFound.vue");

const AdminExtract = () => import("@/pages/admin/AdminExtract.vue");

const AdminAlgobots = () => import("@/pages/admin/AdminAlgobots.vue");
const AdminPerformanceCycles = () => import("@/pages/admin/AdminPerformanceCycles.vue");

import store from "./store";

Vue.use(Router);

const requiresAuthentication = process.env.VUE_APP_DISABLE_AUTHENTICATION || true;
const requiresAdminAuthorization = process.env.VUE_APP_DISABLE_AUTHORISATION || true;
const requiresDeveloperAuthorization = process.env.VUE_APP_DISABLE_AUTHORISATION || true;

const router = new Router({
  mode: "history",
  linkActiveClass: "is-active",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      meta: { requiresAuth: requiresAuthentication },
      component: Home,
    },
    {
      path: "/my-wallet",
      name: "portfolio",
      meta: { requiresAuth: requiresAuthentication },
      component: PortfolioOld,
    },
    {
      path: "/portfolio-monitoring",
      name: "portfolio-monitoring",
      meta: { requiresAuth: requiresAuthentication },
      component: Portfolio,
      children: [
        {
          path: "/portfolio-monitoring/summary",
          name: "portfolio-monitoring-summary",
          meta: { requiresAuth: requiresAuthentication },
          component: PortfolioMonitoringSummary,
        },
        {
          path: "/portfolio-monitoring/cexs",
          name: "portfolio-monitoring-cexs",
          meta: { requiresAuth: requiresAuthentication },
          component: PortfolioMonitoringCEXs,
        },
        {
          path: "/portfolio-monitoring/eth-portfolio",
          name: "portfolio-monitoring-eth-portfolio",
          meta: { requiresAuth: requiresAuthentication },
          component: PortfolioMonitoringETHPortfolio,
        },
      ],
    },
    {
      path: "/my-performance",
      name: "my-performance",
      meta: { requiresAuth: requiresAuthentication },
      component: MyPerformance,
    },
    {
      path: "/new-trade",
      name: "manual-trade",
      meta: { requiresAuth: requiresAuthentication },
      component: ManualTrade,
    },
    {
      path: "/my-bots",
      name: "my-bots",
      meta: { requiresAuth: requiresAuthentication },
      component: MyBots,
    },
    {
      path: "/dev-mode",
      name: "dev-mode",
      meta: { requiresAuth: requiresAuthentication, requiresDeveloperAuthorization: requiresDeveloperAuthorization },
      component: DevMode,
    },
    {
      path: "/create-new-bot",
      name: "create-new-bot",
      meta: { requiresAuth: requiresAuthentication },
      component: CreateNewBot,
    },
    {
      path: "/bot-detail",
      name: "bot-detail",
      meta: { requiresAuth: requiresAuthentication },
      component: BotDetail,
    },
    {
      path: "/algo-bots",
      name: "algo-bots",
      meta: { requiresAuth: requiresAuthentication },
      component: AlgoBots,
    },

    // WE NEED TO KEEP OLD VERSION PAGE (ALGO BOT DETAILED), REMOVE IT LATER.
    // {
    //   path: "/algo-bot-detailed-old/:id",
    //   name: "algo-bot-detailed-old",
    //   meta: { requiresAuth: requiresAuthentication },
    //   component: AlgoBotDetailed,
    // },

    {
      path: "/algo-bot-detailed/:id",
      name: "algo-bot-detailed",
      meta: { requiresAuth: requiresAuthentication },
      component: AlgoBotDetailedNew,
    },
    {
      path: "/signal-providers",
      name: "signal-providers",
      meta: { requiresAuth: requiresAuthentication },
      component: SignalProviders,
    },
    {
      path: "/learning",
      name: "learning",
      meta: { requiresAuth: requiresAuthentication },
      component: Learning,
    },
    {
      path: "/learning-course",
      name: "learning-course",
      meta: { requiresAuth: requiresAuthentication },
      component: LearningCourse,
    },
    {
      path: "/copy-trading",
      name: "copy-trading",
      meta: { requiresAuth: requiresAuthentication },
      component: CopyTrading,
    },
    {
      path: "/swap",
      name: "swap",
      meta: { requiresAuth: requiresAuthentication },
      component: Swap,
    },
    {
      path: "/staking",
      name: "staking",
      meta: { requiresAuth: requiresAuthentication },
      component: Staking,
    },
    {
      path: "/ubxt-staking",
      name: "ubxt-staking",
      meta: { requiresAuth: requiresAuthentication },
      component: UBXTStaking,
    },
    {
      path: "/ubxt-vault",
      name: "ubxt-vault",
      meta: { requiresAuth: requiresAuthentication },
      component: UBXTVault,
    },
    {
      path: "/ubxt-eth-lp-staking",
      name: "ubxt-eth-lp-staking",
      meta: { requiresAuth: requiresAuthentication },
      component: UBXTETHLPStaking,
    },
    {
      path: "/ubxt-bsc-staking",
      name: "ubxt-bsc-staking",
      meta: { requiresAuth: requiresAuthentication },
      component: UBXTBSCStaking,
    },
    {
      path: "/ubxt-busd-lp-staking",
      name: "ubxt-eth-lp-staking",
      meta: { requiresAuth: requiresAuthentication },
      component: UBXTBUSDLPStaking,
    },
    {
      path: "/ubxt-bridge",
      name: "ubxt-bridge",
      meta: { requiresAuth: requiresAuthentication },
      component: UbxtBridge,
    },
    {
      path: "/profile",
      name: "profile",
      meta: { requiresAuth: requiresAuthentication },
      component: Profile,
    },
    {
      path: "/keys",
      name: "keys",
      meta: { requiresAuth: requiresAuthentication },
      component: ExchangeKeys,
    },
    {
      path: "/bot-performance",
      name: "bot-performance",
      meta: { requiresAuth: requiresAuthentication },
      component: BotPerformance,
    },
    {
      path: "/ubxt-info",
      name: "ubxt-info",
      meta: { requiresAuth: requiresAuthentication },
      component: UBXTInfo,
    },
    {
      path: "/ubxt-wallet",
      name: "ubxt-wallet",
      meta: { requiresAuth: requiresAuthentication },
      component: UBXTWallet,
    },
    {
      path: "/terms-conditions",
      name: "terms-conditions",
      component: TermsConditions,
    },
    {
      path: "/privacy-policy",
      name: "privacy-policy",
      component: PrivacyPolicy,
    },
    {
      path: "/coming-soon",
      name: "coming-soon",
      meta: { requiresAuth: requiresAuthentication },
      component: ComingSoon,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/totp-auth",
      name: "totp-auth",
      component: TotpAuthentification,
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: PasswordReset,
    },
    {
      path: "/recover-password",
      name: "recover-password",
      component: PasswordRecover,
    },
    {
      path: "/verify",
      name: "verify",
      component: AccountActivation,
    },
    {
      path: "/notifications",
      name: "notifications",
      component: Notifications,
    },
    {
      path: "/playground",
      name: "playground",
      meta: { requiresAuth: requiresAuthentication },
      component: Playground,
    },
    {
      path: "*",
      name: "not-found",
      component: NotFound, //catch all route (404-like)
    },
    {
      path: "/admin-extract",
      name: "admin-extract",
      meta: { requiresAuth: requiresAuthentication, requiresAdminAuthorization: requiresAdminAuthorization },
      component: AdminExtract,
    },
    {
      path: "/admin-algobots",
      name: "admin-algobots",
      meta: { requiresAuth: requiresAuthentication, requiresAdminAuthorization: requiresAdminAuthorization },
      component: AdminAlgobots,
    },
    {
      path: "/admin-performance-cycles",
      name: "admin-performance-cycles",
      meta: { requiresAuth: requiresAuthentication, requiresAdminAuthorization: requiresAdminAuthorization },
      component: AdminPerformanceCycles,
    },
  ],

  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
});

router.beforeEach((to: Route, from: Route, next: any) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters["authModule/getUserIsAuthenticated"]) {
      next({ name: "login" }); // if not authenticated, redirect to login page.
    } else if (to.matched.some((record) => record.meta.requiresAdminAuthorization)) {
      // eslint-disable-next-line no-console
      if (!store.getters["authModule/isAdminUser"]) {
        next({ name: "home" }); // if not ADMIN, redirect to landing page.
      } else {
        next(); // go to wherever I'm going
      }
    } else if (to.matched.some((record) => record.meta.requiresDeveloperAuthorization)) {
      // eslint-disable-next-line no-console
      if (!store.getters["authModule/isDeveloperUser"]) {
        next({ name: "home" }); // if not DEVELOR, redirect to landing page.
      } else {
        next(); // go to wherever I'm going
      }
    } else {
      next(); // go to wherever I'm going
    }
  } else {
    next(); // when requiresAuth is false, make sure to always call next()!
  }
});

export default router;
