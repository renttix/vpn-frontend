import React from 'react';
import Layout from '@/components/layout/Layout';
import { Metadata } from 'next';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';

export const metadata: Metadata = {
  title: 'Ethical Journalism Policy and Mission Statement | VPN News',
  description: 'Our commitment to accurate, fair, and ethically sound journalism. Learn about our editorial standards, fact-checking process, and ethical guidelines.',
};

export default async function EthicalJournalismPolicyPage() {
  // Fetch categories for the header
  const categoriesQuery = groq`*[_type == "category"]{ _id, title, slug }`;
  const categories = await client.fetch(categoriesQuery);

  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 border border-gray-200 dark:border-gray-700 rounded-sm">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-vpn-blue dark:text-blue-400 mb-6">
            VPN Ethical Journalism Policy and Mission Statement
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Mission Statement</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Video Production News (VPN) is committed to producing accurate, fair, and ethically sound journalism. Since our inception, we have built our reputation on transparent editorial standards, verifiable information, and a commitment to serving the public interest above all else.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN does not align itself with any private, political, or financial agendas. Our foremost obligation is to report the truth—no matter how inconvenient or unpopular—with clarity, balance, and integrity.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Our ethical guidelines apply to all editorial staff, freelance contributors, and associated personnel involved in the creation or dissemination of content on VPN platforms.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Should any reader identify a factual inaccuracy or ethical concern, we encourage immediate contact with the editorial team. All concerns will be treated with urgency and respect.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Violations of this policy may result in disciplinary action, including termination of engagement, regardless of the staff member's seniority or history with VPN.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Distinction Between News, Editorial, and Opinion</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN maintains a strict editorial separation between factual news reporting, analysis, editorial commentary, and opinion. While each category serves an important role in a free press, they are clearly signposted to prevent reader confusion and uphold editorial integrity.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              The labelling structure is as follows:
            </p>
            <ul className="list-disc pl-6 mb-4 font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 space-y-2">
              <li><strong className="font-bold">Exclusive</strong> – Original reporting conducted by VPN journalists.</li>
              <li><strong className="font-bold">News</strong> – Reports on current events based on verified, factual information.</li>
              <li><strong className="font-bold">Analysis</strong> – A breakdown of the context and implications of news stories.</li>
              <li><strong className="font-bold">Opinion</strong> – A signed article expressing the views of an individual contributor.</li>
              <li><strong className="font-bold">Review</strong> – A critical assessment by a professional reviewer.</li>
            </ul>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              All "News" articles must remain impartial and avoid editorialising or promoting one viewpoint over another.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Attribution Policy</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              All facts, data, quotations, and material not produced by VPN staff must be fully attributed to their original source, whether through hyperlinks, footnotes, or formal citations. Plagiarism, including the unattributed use of text or ideas, is grounds for immediate dismissal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Fact-Checking Policy</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              All reporters are responsible for the initial verification of their submissions. All content undergoes a multi-stage editorial review before publication to ensure factual accuracy and editorial consistency.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Facts that are not common knowledge must be sourced from reliable, verifiable entities. Social media or other unregulated platforms must never be treated as primary sources without corroboration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Conflicts of Interest</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Staff must disclose any personal, political, or financial interests that may influence—or appear to influence—their reporting. These disclosures must be made to a senior editor in advance. Breaches of this policy may result in disciplinary measures.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Protecting Editorial Independence</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Staff must seek written approval from senior editorial leadership before:
            </p>
            <ul className="list-disc pl-6 mb-4 font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 space-y-2">
              <li>Participating in events, broadcasts, or public forums where their presence could be interpreted as representing VPN.</li>
              <li>Accepting paid speaking engagements.</li>
            </ul>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN prohibits accepting payment, gifts, or hospitality from media, political, or commercial entities unless transparently disclosed and approved in advance. Acceptable exceptions include publicly available discounts or educational speaking fees from non-lobbying institutions (e.g., universities).
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Any speaking engagement exceeding £3,000 must be reviewed by a senior editor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Gifts and Hospitality</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN discourages the acceptance of gifts. Any item or benefit not made available to the general public must be refused unless cleared by an editor. Press access (e.g., to theatre or concert events) is permitted when necessary for coverage, but not for personal gain.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Disclosure of Identity</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Journalists must identify themselves honestly when seeking information. Undercover work or anonymity may be permitted only in rare cases—subject to approval from the Editor-in-Chief—and in line with UK law, particularly when there is demonstrable public interest.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Impersonating police officers, government officials, or legal professionals is strictly prohibited under UK law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Use of Equipment and Media</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Any equipment or review material loaned to staff for professional use must be returned promptly. Items such as books, DVDs, or digital media received for review may be retained only if explicitly considered part of a press kit. Materials must not be copied, distributed, or stored in unsecured locations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Fair Trial and Legal Reporting Policy</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN adheres to the principles of fair and accurate court reporting in accordance with the Contempt of Court Act 1981 and the Editors' Code of Practice.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              When reporting on individuals who have been arrested but not yet convicted, we avoid prejudicing ongoing legal proceedings. Allegations should be clearly described as such, and care must be taken not to portray suspects as guilty prior to due process.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              We do not report confessions unless they have been admitted into evidence in open court. Where confusion may arise due to common names, additional identifiers may be used (e.g., age, occupation), but specific addresses will be withheld.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Publication Restrictions and Bans</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN complies with all court-issued publication bans, particularly those under the Youth Justice and Criminal Evidence Act 1999 and other relevant UK statutes.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              If a publication ban is believed to disproportionately suppress information in the public interest, VPN may, on the direction of senior editors, seek legal advice on whether to challenge it in court.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Reporting on Suicide</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN may report on suicide when there is a clear public interest. In such cases, we avoid sensationalism, graphic details, or speculation. We follow guidance from the Samaritans' Media Guidelines and all such articles must receive prior approval from the Editor-in-Chief.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Extremism and Serial Offenders</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN reports on terrorism, extremism, and serial crimes with care to avoid glorifying the perpetrators. Use of photographs or names is minimised unless essential to public understanding. In most cases, we focus on victims, context, and public safety rather than notoriety.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Diversity and Inclusion</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN values a diverse and respectful workplace and content platform. We do not enforce quotas, but we expect all staff to treat colleagues and contributors with respect, irrespective of background, belief, or identity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Take-Down Requests</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              We do not remove content from our archives unless legally compelled to do so. However, if a legitimate concern is raised—such as the potential for real-world harm or doxxing—senior editors may review the case. Corrections or updates will be issued promptly when errors are found.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Sourcing and Confidentiality</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              VPN is committed to transparency in sourcing. All sources are disclosed unless a request for anonymity has been agreed upon due to credible safety, professional, or legal risks.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Anonymous sources are discouraged unless vital to the story and approved by senior editors. Readers will be informed when anonymous sources are used and the justification for doing so.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Balance and Right of Reply</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Key individuals or organisations referenced in critical reporting must be offered a right of reply before publication. Evidence of contact attempts must be documented in the editorial process. A lack of response will be noted in the article.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-vpn-gray dark:text-white mb-4">Children and Victims of Sexual Offences</h2>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              In compliance with the Sexual Offences (Amendment) Act 1992, VPN does not publish the names of victims of sexual offences without their informed consent, or the consent of a guardian where applicable.
            </p>
            <p className="font-body text-base md:text-lg text-vpn-gray dark:text-gray-300 mb-4">
              Under the Youth Justice and Criminal Evidence Act, no identifying information about under-18s involved in legal proceedings—whether victims or accused—will be published unless a court permits it or the subject consents after turning 18.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
