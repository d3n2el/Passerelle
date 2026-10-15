/** Reviewed preparation prompts, not legal determinations or a tariff dataset. */
export const RULE_VERSION = 'prep-2026.10.08.1';
export const CONTENT_REVIEWED_AT = '2026-10-08';

export const SOURCES = Object.freeze({
  importing: { title: 'GOV.UK — Import goods into the UK', url: 'https://www.gov.uk/import-goods-into-uk' },
  classification: { title: 'GOV.UK — Finding commodity codes', url: 'https://www.gov.uk/guidance/finding-commodity-codes-for-imports-or-exports' },
  origin: { title: 'GOV.UK — Rules of origin for UK–EU trade', url: 'https://www.gov.uk/guidance/introduction-to-rules-of-origin-and-claiming-duties-when-trading-between-the-uk-and-eu' },
  valuation: { title: 'GOV.UK — Customs valuation', url: 'https://www.gov.uk/government/collections/working-out-the-customs-value-of-your-imported-goods' },
  vat: { title: 'GOV.UK — Postponed VAT accounting', url: 'https://www.gov.uk/guidance/check-when-you-can-account-for-import-vat-on-your-vat-return' },
  representation: { title: 'GOV.UK — Get someone to deal with customs', url: 'https://www.gov.uk/guidance/appoint-someone-to-deal-with-customs-on-your-behalf' },
  eori: { title: 'Douane française — Enregistrer votre entreprise (EORI)', url: 'https://www.douane.gouv.fr/demarche/enregistrer-votre-entreprise-aupres-de-la-douane-numero-eori' },
  northernIreland: { title: 'GOV.UK — Trading and moving goods in Northern Ireland', url: 'https://www.gov.uk/guidance/trading-and-moving-goods-in-and-out-of-northern-ireland' },
});

// Interface translations, not official translations of the linked guidance.
const COPY = {
  fr: {
    kinds: { preparation: 'Préparation', confirm: 'Applicabilité à confirmer', specialist: 'Avis spécialisé' },
    categories: { route: 'Itinéraire', registration: 'Entreprise', responsibilities: 'Responsabilités', goods: 'Marchandises', documents: 'Documents', transport: 'Transport', charges: 'Droits et TVA', compliance: 'Produit' },
    route: ['Faire examiner cet itinéraire', 'L’Irlande du Nord suit un cadre distinct de celui de la Grande-Bretagne. Ce MVP ne détermine pas les formalités ni les taxes pour cet itinéraire.', 'La destination est en Irlande du Nord ou reste à préciser.', 'Précisez la destination et le trajet exact, y compris les pays de transit, avec un spécialiste avant de chiffrer les droits et taxes.'],
    registration: ['Préparer les informations de votre entreprise', 'Rassemblez la raison sociale, les adresses et les identifiants utilisés pour les formalités.', 'Il s’agit de votre premier envoi ou un identifiant EORI reste à vérifier.', 'Vérifiez l’EORI de l’exportateur et demandez à l’importateur de confirmer ses identifiants adaptés à l’itinéraire.'],
    responsibilities: ['Clarifier qui fait quoi', 'Convenez par écrit de qui organise le transport, prépare les déclarations et prend en charge les frais.', 'Chaque envoi implique une répartition des tâches entre vendeur, acheteur et prestataires.', 'Confirmez l’importateur, l’Incoterm et le lieu convenu avec l’acheteur et le déclarant.'],
    missingResponsibility: ['Identifier l’importateur et l’Incoterm', 'Sans ces informations, vous ne savez pas encore à qui attribuer les frais estimés.', 'L’importateur ou l’Incoterm n’est pas défini.', 'Demandez à votre acheteur qui sera importateur et quelles conditions de vente figureront sur le devis.'],
    sellerImporter: ['Faire examiner votre rôle au Royaume-Uni', 'Une vente DDP ou votre rôle d’importateur mérite un examen de la représentation douanière et de la TVA.', 'Vous envisagez DDP ou de devenir vous-même importateur.', 'Avant de vous engager, demandez à un spécialiste quelles démarches, immatriculations et responsabilités correspondent à votre situation.'],
    classification: ['Faire confirmer le code douanier', 'Le code décrit le produit pour les douanes. Un code saisi ici n’est pas vérifié automatiquement.', 'Le classement influe sur les droits et les mesures susceptibles de concerner le produit.', 'Transmettez la composition, l’usage et une fiche technique au déclarant pour confirmer le code complet applicable.'],
    origin: ['Documenter l’origine des marchandises', 'Le lieu d’expédition et l’origine douanière sont deux informations différentes.', 'Les marchandises partent de France, mais leur origine doit être établie séparément.', 'Demandez au fabricant les éléments sur la fabrication et les composants ; faites confirmer l’origine.'],
    preference: ['Vérifier la préférence tarifaire envisagée', 'Votre réponse ne prouve pas l’éligibilité à un droit réduit ou nul. Les règles d’origine du produit et les preuves doivent être examinées.', 'Vous pensez bénéficier d’une origine préférentielle.', 'Faites valider la règle applicable et la preuve à utiliser avant de revendiquer la préférence.'],
    invoice: ['Préparer les données de facture et de colisage', 'Rassemblez vendeur, acheteur, description, quantités, valeur, devise, poids et contenu des colis.', 'Ces données servent à préparer un dossier cohérent pour le transporteur et le déclarant.', 'Vérifiez la cohérence de la facture, des colis et des conditions de vente. Demandez quels justificatifs fournir pour cet envoi.'],
    declaration: ['Organiser la préparation douanière', 'Convenez avec le déclarant des données et autorisations à lui fournir.', 'Le passage en douane doit être préparé avec la personne chargée de l’effectuer.', 'Confirmez les formalités applicables de chaque côté, les délais, le mandat éventuel et les justificatifs à conserver.'],
    transport: ['Valider le devis de transport et de dédouanement', 'Demandez un devis précisant les prestations incluses et les suppléments possibles.', 'Un montant saisi ne garantit pas qu’il couvre toutes les prestations nécessaires.', 'Confirmez l’itinéraire, le délai, l’assurance, le dédouanement et les éventuels frais de stockage ou de contrôle.'],
    missingCosts: ['Compléter les frais encore inconnus', 'Le transport ou les frais de dédouanement n’ont pas encore été chiffrés.', 'Au moins un poste de coût manque dans l’estimation.', 'Obtenez un devis du transporteur ou du déclarant puis mettez à jour l’estimation. Un champ vide ne signifie pas zéro.'],
    valuation: ['Faire vérifier les bases et taux utilisés', 'La valeur en douane et la base de TVA peuvent différer du prix facturé. Aucun tarif douanier en direct n’est intégré.', 'Les montants calculés reposent uniquement sur les hypothèses que vous saisissez.', 'Faites confirmer le taux, la base, les ajustements et le taux de change douanier éventuel pour la date d’envoi.'],
    vat: ['Confirmer le traitement de la TVA', 'La TVA peut, selon la situation de l’importateur, être récupérable ou comptabilisée séparément. Elle n’est pas nécessairement un coût définitif.', 'Le calendrier de paiement et le droit à déduction dépendent de la situation de l’importateur.', 'Demandez à son comptable ou au déclarant de confirmer le taux, la base, le paiement et les conditions d’une éventuelle comptabilisation différée.'],
    product: ['Faire examiner les règles du produit', 'La catégorie déclarée peut appeler un examen des règles de sécurité, d’étiquetage, sanitaires ou de certification.', 'Votre catégorie est potentiellement réglementée, « autre » ou incertaine.', 'Transmettez la fiche technique à un spécialiste du produit. Demandez quels contrôles, étiquettes ou certificats peuvent s’appliquer avant l’envoi.'],
    complexity: {
      review: ['Avis spécialisé conseillé', 'La destination, le produit ou votre rôle d’importateur nécessite une revue ciblée avant de vous engager. La checklist prépare cet échange.'],
      check: ['Des points restent à confirmer', 'Des informations ou hypothèses de coût restent à vérifier. Commencez par les points prioritaires de votre checklist.'],
      standard: ['Préparation courante à vérifier', 'Aucun signal de complexité supplémentaire n’a été déclaré. Cela ne valide ni la conformité du produit ni les formalités de l’envoi.'],
    },
  },
  en: {
    kinds: { preparation: 'Preparation', confirm: 'Confirm applicability', specialist: 'Specialist review' },
    categories: { route: 'Route', registration: 'Company', responsibilities: 'Responsibilities', goods: 'Goods', documents: 'Documents', transport: 'Transport', charges: 'Duty and VAT', compliance: 'Product' },
    route: ['Get this route reviewed', 'Northern Ireland has a different framework from Great Britain. This MVP does not determine the formalities or taxes for this route.', 'The destination is Northern Ireland or has not been confirmed.', 'Confirm the exact destination and route, including transit countries, with a specialist before estimating duties and taxes.'],
    registration: ['Prepare your company information', 'Gather legal names, addresses and identifiers used for formalities.', 'This is your first shipment or an EORI identifier still needs checking.', 'Check the exporter’s EORI and ask the importer to confirm the identifiers appropriate to the route.'],
    responsibilities: ['Agree who does what', 'Agree in writing who arranges transport, prepares declarations and pays each charge.', 'Every shipment involves dividing tasks between seller, buyer and providers.', 'Confirm the importer, Incoterm and named place with the buyer and the person making declarations.'],
    missingResponsibility: ['Identify the importer and Incoterm', 'Until these are agreed, the estimated costs cannot be allocated to a particular party.', 'The importer or Incoterm has not been decided.', 'Ask your buyer who will act as importer and which sales terms should appear on your quotation.'],
    sellerImporter: ['Review your role in the UK', 'A DDP sale or acting as importer calls for a review of customs representation and VAT.', 'You are considering DDP or acting as importer yourself.', 'Before committing, ask a specialist which registrations, processes and responsibilities fit your circumstances.'],
    classification: ['Confirm the commodity code', 'This code describes the product for customs. Entering a code here does not verify it.', 'Classification affects duty and the measures that may apply to the product.', 'Give your customs agent the composition, intended use and technical information to confirm the complete applicable code.'],
    origin: ['Document the origin of the goods', 'The country of dispatch and customs origin are different facts.', 'The goods leave France, but their origin must be established separately.', 'Ask the manufacturer for production and component information, then have the origin checked.'],
    preference: ['Check the proposed tariff preference', 'Your answer does not establish eligibility for reduced or zero duty. The product’s origin rules and supporting evidence need review.', 'You believe the goods have preferential origin.', 'Have the applicable rule and evidence checked before claiming preference.'],
    invoice: ['Prepare invoice and packing information', 'Gather seller, buyer, description, quantities, value, currency, weights and the contents of each package.', 'These details help the carrier and customs agent prepare a consistent shipment file.', 'Check the invoice, packages and sales terms agree. Ask which supporting documents to provide for this shipment.'],
    declaration: ['Arrange customs preparation', 'Agree which information and authorisations to give the person preparing your declarations.', 'Customs processing needs preparation with the person handling it.', 'Confirm applicable formalities on both sides, deadlines, any authority to act and records to keep.'],
    transport: ['Confirm transport and clearance quotations', 'Ask for a quotation specifying the services included and possible additional charges.', 'An entered amount does not guarantee all necessary services are covered.', 'Confirm the route, timing, insurance, clearance and any storage or inspection charges.'],
    missingCosts: ['Fill in the outstanding costs', 'Transport or clearance fees have not yet been priced.', 'At least one cost line is missing from the estimate.', 'Obtain a quotation from the carrier or agent and update the estimate. A blank field does not mean zero.'],
    valuation: ['Have the rates and calculation bases checked', 'Customs value and the VAT base may differ from the invoice price. HMRC reference lookups are not applied automatically.', 'Calculated amounts rely solely on assumptions you enter.', 'Confirm rates, bases, adjustments and any customs exchange rate for the shipment date.'],
    vat: ['Confirm how VAT will be handled', 'Depending on the importer’s circumstances, VAT may be recoverable or accounted for separately. It is not necessarily a permanent cost.', 'Payment timing and recovery depend on the importer’s circumstances.', 'Ask their accountant or agent to confirm the rate, base, payment and eligibility for any postponed VAT accounting.'],
    product: ['Have the product rules reviewed', 'The selected category may need a review of safety, labelling, sanitary or certification rules.', 'Your category is potentially regulated, “other” or uncertain.', 'Give a product specialist the technical information. Ask which checks, labels or certificates may apply before shipping.'],
    complexity: {
      review: ['Specialist review recommended', 'The destination, product or your role as importer needs a focused review before you commit. The checklist prepares that conversation.'],
      check: ['Some points need confirmation', 'Information or cost assumptions remain unverified. Start with the priority points in your checklist.'],
      standard: ['Routine preparation to verify', 'No additional complexity signal was declared. This does not validate product compliance or shipment formalities.'],
    },
  },
};

const isUnknown = (value) => value === undefined || value === null || value === '' || value === 'unknown';
const needsOriginDetails = (data) => !['FR', 'GB', 'CN'].includes(data.originCountry);
const hasProductCaution = (data) => data.category !== 'general' || data.regulated === true || data.regulated === 'yes';
const needsRouteReview = (data) => data.destinationArea !== 'gb';
const missingCosts = (data) => isUnknown(data.transportCost) || isUnknown(data.brokerFee);

// Predicates are deliberately conservative. No answer automatically completes an item.
const RULES = [
  { id: 'route-review', copy: 'route', category: 'route', kind: 'specialist', priority: 'high', source: 'northernIreland', when: needsRouteReview },
  { id: 'product-review', copy: 'product', category: 'compliance', kind: 'specialist', priority: 'high', source: 'importing', when: hasProductCaution },
  { id: 'seller-importer', copy: 'sellerImporter', category: 'responsibilities', kind: 'specialist', priority: 'high', source: 'representation', when: (d) => d.incoterm === 'DDP' || d.importer === 'seller' },
  { id: 'missing-responsibilities', copy: 'missingResponsibility', category: 'responsibilities', kind: 'confirm', priority: 'high', when: (d) => isUnknown(d.incoterm) || isUnknown(d.importer) },
  { id: 'company-registration', copy: 'registration', category: 'registration', kind: 'confirm', priority: 'high', source: 'eori', when: (d) => d.experience !== 'repeat' || d.exporterEori !== 'yes' || d.importerEori !== 'yes' },
  { id: 'classification', copy: 'classification', category: 'goods', kind: 'confirm', priority: (d) => !d.hsCode ? 'high' : 'medium', source: 'classification' },
  { id: 'origin', copy: 'origin', category: 'goods', kind: 'confirm', priority: (d) => needsOriginDetails(d) ? 'high' : 'medium', source: 'origin' },
  { id: 'preferential-origin', copy: 'preference', category: 'goods', kind: 'confirm', priority: 'high', source: 'origin', when: (d) => d.preferentialOrigin === 'yes' },
  { id: 'missing-costs', copy: 'missingCosts', category: 'charges', kind: 'preparation', priority: 'medium', when: missingCosts },
  { id: 'valuation-rates', copy: 'valuation', category: 'charges', kind: 'confirm', priority: 'medium', source: 'valuation' },
  { id: 'vat-treatment', copy: 'vat', category: 'charges', kind: 'confirm', priority: 'medium', source: 'vat', when: (d) => !needsRouteReview(d) },
  { id: 'responsibilities', copy: 'responsibilities', category: 'responsibilities', kind: 'preparation', priority: 'normal', source: 'representation' },
  { id: 'invoice-packing', copy: 'invoice', category: 'documents', kind: 'preparation', priority: 'normal' },
  { id: 'customs-preparation', copy: 'declaration', category: 'documents', kind: 'confirm', priority: 'normal', source: 'importing', when: (d) => !needsRouteReview(d) },
  { id: 'transport', copy: 'transport', category: 'transport', kind: 'preparation', priority: 'normal' },
];

/** Returns fresh localized items; user completion state is managed outside the rules. */
export function generateChecklist(data = {}, lang = 'fr') {
  const copy = COPY[lang] || COPY.fr;
  const order = { high: 0, medium: 1, normal: 2 };
  return RULES.filter((rule) => !rule.when || rule.when(data)).map((rule) => {
    const [title, description, reason, nextStep] = copy[rule.copy];
    return {
      id: rule.id, title, description, reason, nextStep,
      priority: typeof rule.priority === 'function' ? rule.priority(data) : rule.priority,
      status: rule.kind === 'preparation' ? 'todo' : 'check',
      category: copy.categories[rule.category], kind: copy.kinds[rule.kind],
      ...(rule.source ? { source: { ...SOURCES[rule.source] } } : {}),
    };
  }).sort((a, b) => order[a.priority] - order[b.priority]);
}

/** A preparation signal, never a clearance or compliance assessment. */
export function getComplexity(data = {}, lang = 'fr') {
  const copy = COPY[lang] || COPY.fr;
  const specialist = needsRouteReview(data) || hasProductCaution(data) || data.incoterm === 'DDP' || data.importer === 'seller';
  const unresolved = !data.hsCode || needsOriginDetails(data) || isUnknown(data.incoterm) || isUnknown(data.importer)
    || data.exporterEori !== 'yes' || data.importerEori !== 'yes' || data.experience !== 'repeat'
    || data.dutyMode !== 'illustrative' || data.vatMode !== 'illustrative' || isUnknown(data.vatTreatment)
    || data.preferentialOrigin !== 'no' || missingCosts(data);
  const level = specialist ? 'review' : unresolved ? 'check' : 'standard';
  const [title, description] = copy.complexity[level];
  return { level, title, description };
}
