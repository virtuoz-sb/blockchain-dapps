<template>
  <div
    class="terms-conditions flex flex-col flex-grow bg-kuroi-black-opacity py-30 md:py-50 px-20 md:px-30 overflow-y-auto custom-scrollbar"
  >
    <div class="flex flex-col items-center justify-center flex-shrink-0 mb-24">
      <div class="flex w-50 h-50 rounded-full mx-auto mb-5 overflow-hidden">
        <img src="@/assets/images/UpBotsLogo.png" alt="Upbots logo" class="w-full h-full self-center object-cover" />
      </div>

      <h1 class="text-center">Terms and Conditions</h1>
    </div>

    <!-- DESKTOP CONTENT -->
    <div class="flex flex-col w-full relative overflow-y-auto custom-scrollbar">
      <ul class="flex flex-col flex-shrink-0">
        <li class="flex flex-col mb-20">
          <h2 class="mb-10">1. What You Need to Know</h2>
          <p class="flex flex-col">
            <span class="mb-10">
              The Services do not offer financial advice, the acquisition, and sale of financial instruments by us or another user for your
              account, portfolio management, investment management, or any consulting or advisory services to you by us or any other user.
              We are also not offering any deposit or custodial services for cryptographic or other assets. Upbots is not a bank or
              financial institution and does not provide financial services or financial market infrastructure. We are a software as a
              service provider that enables a platform for users to get consolidated overviews in dashboards of their cryptographic and
              other assets held with third party-exchanges by opening APIs and to access trading signals, copy- trading, and trading bots
              and use such trading tools for the cryptographic and other assets held with third party-exchanges via the third-party
              exchanges APIs.
            </span>
            <span class="mb-10">
              Only you have access to your cryptographic and other assets held with third party-exchanges. Viewing your balances of
              cryptographic and other assets in the Services is thus only possible if the third-party exchange where you hold your assets
              offers API access and you granted access to such balances, all subject to the terms and conditions of the respective
              third-party exchange.
            </span>
            <span>
              By using the Services you agree to be bound by these Terms. If you do not want to agree to these Terms, you must not access or
              use the Services.
            </span>
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">2. We are Currently in Test-Phase</h2>
          <p>
            The Services are currently in a test phase and not all features are enabled, for example, but not limited to giving you the
            possibility to offer trading signals, copy-trading, or trading bots to other users. Due to the nature of testing, features may
            be changed, extended, or removed. You acknowledge that in particular, but not exclusively (see below) in the test phase, the
            risks for errors, inaccuracies failures, corruption or loss of data, or - if you apply trading tools to you cryptographic or
            other assets held with a third party exchange – unwanted transaction regarding your cryptographic assets or other assets held
            with a third party-exchange will be executed, is very high. You agree that we are not responsible for any costs, expenses, or
            other liabilities you may incur as a result of your testing, and that also during the test phase, our liability, and that of our
            parent(s), affiliates, related companies, officers, directors, employees, agents, representatives, partners, and licensors, is
            limited to the maximum extent permissible in your country of residence.
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">3. Who May Use the Services</h2>
          <p>
            You may use the Services only if you agree to form a binding contract with the UBX Software LLC, Saint Vincent, and are not a
            person barred from receiving services under the laws of the applicable jurisdiction. In any case, you must have the legal
            capacity to form a binding contract with us under the page 2 of 5 applicable law. If you are accepting these Terms and using the
            Services on behalf of a company, organization, government, or other legal entity, you warrant that you are authorized to do so
            and have the authority to bind such entity to these Terms, in which case the words “you” and “your” as used in these Terms shall
            refer to such entity.
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">4. Privacy</h2>
          <p>
            Our
            <router-link tag="span" :to="{ name: 'privacy-policy' }" class="text-blue-cl-100 cursor-pointer">Privacy Policy</router-link>
            describes how we handle the information you provide to us when you use our Services. You understand that the collection,
            processing, and use of such information by us and our affiliates (as outlined in the Privacy Policy), including the transfer of
            the information to other countries, is required to perform the Services.
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">Using the Services</h2>
          <p class="flex flex-col">
            <span class="mb-10">
              Your use of the Services must not violate any applicable laws, regulations, including financial market laws, export control
              laws, or other laws in your jurisdiction. You are responsible for making sure that your use of the Services complies with laws
              and any applicable regulations.
            </span>
            <span class="mb-10">
              You may not use, or encourage, instigate, promote, facilitate, or instruct others to use, the Services for any illegal,
              harmful, fraudulent, or infringing use.
            </span>
            <span class="mb-10">
              Our Services evolve constantly. As such, the Services may change from time to time, at our discretion. We may stop
              (permanently or temporarily) providing the Services or any features within the Services to you or to users generally. We also
              retain the right to create limits on use at our sole discretion at any time. We may suspend or terminate users, and reclaim
              trading tools without liability to you.
            </span>
            <span>
              You agree not to misuse our Services, for example, by interfering with them or accessing them using a method other than the
              interface and the instructions that we provide. You may not do any of the following while accessing or using the Services: (i)
              access, tamper with, or use non-public areas of the Services, our computer systems, or the technical delivery systems of our
              providers; (ii) probe, scan, or test the vulnerability of any system or network or breach or circumvent any security or
              authentication measures; (iii) interfere with, or disrupt, (or attempt to do so), the access of any user, host or network,
              including, without limitation, sending a virus, overloading, flooding, spamming, mail-bombing the Services. We also reserve
              the right to access, read, preserve, and disclose any information that you have provided in connection with the Services as we
              reasonably believe is necessary to (i) satisfy any applicable law, regulation, legal process or governmental request, (ii)
              enforce the Terms, including investigation of potential violations hereof, (iii) detect, prevent, or otherwise address fraud,
              security or technical issues, (iv) respond to user support requests, or (v) protect the rights, property or safety of us, our
              users and the public. We do not disclose personally-identifying information to third parties except according to our Privacy
              Policy.
            </span>
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">Fees we may Charge</h2>
          <p>
            We expressly reserve the right to charge fees for the use of all or specific functions of the Services (including additional
            functionalities added at a later stage), now or in the future. Some features of the Services may require the possibility of
            automated fee collection (direct debit) through APIs, which require the use of supported third-party account (wallet) solutions.
            By using any of the supported third- party account (wallet) solutions for automated collection, you acknowledge that such
            solutions are not offered by us, they are governed by separate terms and conditions, we do not have control, and we are not
            responsible for any costs, expenses, other liabilities, damages or losses you may incur as a page 3 of 5 result of using such
            solutions. The support of a specific solution is neither a recommendation nor a guarantee or warranty for such a solution.
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">Information and Content Available</h2>
          <p class="flex flex-col">
            <span class="mb-10">
              The Services include information and content from us as well as from websites, databases, or platforms offered by independent
              third parties. Links to such other websites, databases, or platforms or information and content from such websites, databases,
              or platforms are neither a recommendation nor a guarantee or warranty and do not mean that we agree with the intended
              usability, contents, functionalities of such websites and platforms.
            </span>
            <span>
              Any use or reliance on any information or content available via the Services - whether provided by us or by third-parties
              -obtained by you through the Services is at your own risk and you acknowledge that we exclude all liability to the extent
              permitted by applicable law. We do not endorse, support, represent or guarantee the completeness, truthfulness, accuracy, or
              reliability of any information and content made available via the Services.
            </span>
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">Your Account</h2>
          <p class="flex flex-col">
            <span class="text-white mb-10">
              You need to create an account to use our Services. You are responsible for safeguarding your account, so use a strong password
              and limit its use to this account. We cannot and will not be liable for any loss or damage arising from your failure to comply
              with the above. Your account should be kept personal to you and not shared with other people.
            </span>
            <span class="text-white">
              You can control most communications from the Services. We may need to provide you with certain communications, such as service
              announcements and administrative messages. These communications are considered part of the Services and your account, and you
              may not be able to opt-out from receiving them.
            </span>
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">Your License to Use the Services</h2>
          <p class="flex flex-col">
            <span class="mb-10">
              We give you a personal, worldwide, royalty-free, non-assignable, and non-exclusive license to use the software provided to you
              as part of the Services. This license has the sole purpose of enabling you to use and enjoy the benefit of the Services as
              provided by us, in the manner permitted by these Terms.
            </span>
            <span>
              Nothing in the Terms gives you a right to use our name or any of our logos, domain names, other distinctive brand features,
              and other proprietary rights. All right, title and interest in and to the Services are and will remain the exclusive property
              of us and our licensors. Any feedback, comments, or suggestions you may provide regarding us or the Services is entirely
              voluntary and we will be free to use such feedback, comments, or suggestions as we see fit and without any obligation to you.
            </span>
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">Ending These Terms</h2>
          <p class="flex flex-col">
            <span class="mb-10">
              You may end your legal agreement with us at any time by deactivating your accounts and discontinuing your use of the Services.
            </span>
            <span>
              We may suspend or terminate your account or cease providing you with all or part of the Services at any time for any or no
              reason, including, but not limited to, if we reasonably believe: (i) you have violated these Terms, (ii) you create risk or
              possible legal exposure for us; (iii) your account should be blocked due to prolonged inactivity; or (iv) our provision of the
              Services to you is no longer commercially viable. We will make reasonable efforts to notify you through the Services the next
              time page 4 of 5 you attempt to access the Services, depending on the circumstances. In all such cases, the Terms shall
              terminate, including, without limitation, your license to use the Services, except that the following sections shall continue
              to apply: sections 4, 5, 6, and 7.
            </span>
          </p>
        </li>

        <li class="flex flex-col mb-20">
          <h2 class="mb-10">Limitations, Release, and Indemnification</h2>
          <p class="flex flex-col">
            <span class="mb-10">
              By using the Services you agree that our liability, and that of our parent(s), affiliates, related companies, officers,
              directors, employees, agents, representatives, partners, and licensors, is limited to the maximum extent permissible in your
              country of residence.
            </span>
            <span>
              You agree to indemnify us, defend us, and hold us harmless from and against any and all claims, liabilities, and expenses,
              including attorneys’ fees, arising out of your use of the Services, including but not limited to your violation of these
              Terms, provided that we (i) promptly gives you written notice of the claim, demand, suit or proceeding; (ii) give you sole
              control of the defense and settlement of the claim, demand, suit or proceeding (provided that you may not settle any claim,
              demand, suit or proceeding unless the settlement unconditionally releases us of all liability); and (iii) provide to you all
              reasonable assistance, at your expense.
            </span>
          </p>
        </li>

        <li class="flex flex-col mb-40">
          <h2 class="mb-10">General</h2>
          <p class="flex flex-col">
            <span class="mb-10">
              We may revise these Terms from time to time. The changes will not be retroactive, and the most current version of the Terms,
              which will always be at <a href="https://demo.upbots.com" class="text-blue-cl-100">https://demo.upbots.com</a>, will govern
              our relationship with you. Other than for changes addressing new functions or made for legal reasons, we will notify you 30
              days in advance of any changes to these Terms that impact the rights or obligations of any party to these Terms, for example
              via our website or other communication channels. By continuing to access or use the Services after those revisions become
              effective, you agree to be bound by the revised Terms.
            </span>
            <span class="mb-10">
              If any provision of these Terms is held to be invalid or unenforceable, then that provision will be limited or eliminated to
              the minimum extent necessary, and the remaining provisions of these Terms will remain in full force and effect. Our failure to
              enforce any right or provision of these Terms will not be deemed a waiver of such right or provision. These Terms are an
              agreement between you and UBX Software LLC, Saint Vincent. If you have any questions about these Terms, please contact
              <a href="mailto:contact@upbots.com" class="text-blue-cl-100">contact@upbots.com</a>.
            </span>
            <span>
              These Terms are governed by the laws of Saint Vincent. The United Nations Convention on the International Sale of Goods shall
              not apply. Any disputes arising under or in connection with these Terms are subject to the exclusive jurisdiction of the
              courts of Saint Vincent.
            </span>
          </p>
        </li>
      </ul>

      <p class="flex items-center flex-shrink-0">
        <span class="text-md font-bold text-grey-cl-920">Effective:</span>&nbsp;
        <span class="text-md font-bold text-white">November, 02, 2020</span>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({ name: "TermsConditions" })
export default class TermsConditions extends Vue {}
</script>

<style lang="scss" scoped>
.terms-conditions {
  h1 {
    @apply text-white;
  }

  h2 {
    @apply text-white font-bold;
  }

  p {
    @apply text-grey-cl-920;
  }

  @media (min-width: 768px) {
    h1 {
      @apply text-xxl3;
    }

    h2 {
      @apply text-xxl2;
    }

    p {
      @apply text-xl;
    }
  }

  @media (max-width: 767px) {
    h1 {
      @apply text-xxl2;
    }

    h2 {
      @apply text-xxl1;
    }

    p {
      @apply text-md;
    }
  }
}
</style>
