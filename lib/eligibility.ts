export type EligibilityPath = readonly string[]

export type EligibilityFieldMode = "display" | "declaration" | "array"

export type EligibilityFieldMapping = {
  key: string
  label: string
  paths: readonly EligibilityPath[]
  mode?: EligibilityFieldMode
  format?: "date"
}

type EligibilityFieldMappings = Record<string, EligibilityFieldMapping>

export const eligibilityFieldMappings: EligibilityFieldMappings = {
  applicantFirstName: {
    key: "applicantFirstName",
    label: "Applicant First Name",
    paths: [["applicantAndProperty", "applicantDetails", "firstName"]],
  },
  applicantMiddleName: {
    key: "applicantMiddleName",
    label: "Applicant Middle Name",
    paths: [["applicantAndProperty", "applicantDetails", "middleName"]],
  },
  applicantLastName: {
    key: "applicantLastName",
    label: "Applicant Last Name",
    paths: [["applicantAndProperty", "applicantDetails", "lastName"]],
  },
  emailAddress: {
    key: "emailAddress",
    label: "Email Address",
    paths: [["applicantAndProperty", "applicantDetails", "emailAddress"]],
  },
  countryCode: {
    key: "countryCode",
    label: "Country Code",
    paths: [["applicantAndProperty", "applicantDetails", "countryCode"]],
  },
  phoneNumber: {
    key: "phoneNumber",
    label: "Phone Number",
    paths: [["applicantAndProperty", "applicantDetails", "phoneNumber"]],
  },
  siteAddressLine1: {
    key: "siteAddressLine1",
    label: "Site Address Line 1",
    paths: [["applicantAndProperty", "applicantDetails", "siteAddress", "line1"]],
  },
  siteAddressLine2: {
    key: "siteAddressLine2",
    label: "Site Address Line 2",
    paths: [["applicantAndProperty", "applicantDetails", "siteAddress", "line2"]],
  },
  council: {
    key: "council",
    label: "Council",
    paths: [
      ["applicantAndProperty", "councilApplicationHistory", "councilName"],
      ["location", "lpaName"],
      ["location", "lpa_name"],
    ],
  },
  postcode: {
    key: "postcode",
    label: "Postcode",
    paths: [
      ["applicantAndProperty", "applicantDetails", "siteAddress", "postcode"],
      ["applicantAndProperty", "applicantDetails", "postcode"],
      ["location", "postcode"],
    ],
  },
  useAlternateCorrespondenceAddress: {
    key: "useAlternateCorrespondenceAddress",
    label: "Alternate address for correspondence?",
    paths: [
      ["applicantAndProperty", "applicantDetails", "useAlternateCorrespondenceAddress"],
      ["applicantAndProperty", "applicantDetails", "correspondenceAddress", "enabled"],
    ],
  },
  correspondenceAddressLine1: {
    key: "correspondenceAddressLine1",
    label: "Correspondence Address Line 1",
    paths: [["applicantAndProperty", "applicantDetails", "correspondenceAddress", "line1"]],
  },
  correspondenceAddressLine2: {
    key: "correspondenceAddressLine2",
    label: "Correspondence Address Line 2",
    paths: [["applicantAndProperty", "applicantDetails", "correspondenceAddress", "line2"]],
  },
  correspondencePostcode: {
    key: "correspondencePostcode",
    label: "Correspondence Postcode",
    paths: [["applicantAndProperty", "applicantDetails", "correspondenceAddress", "postcode"]],
  },
  usesPlanningAgent: {
    key: "usesPlanningAgent",
    label: "Are you using a planning agent?",
    paths: [["applicantAndProperty", "agentDetails", "usesPlanningAgent"]],
  },
  agentName: {
    key: "agentName",
    label: "Agent Name",
    paths: [["applicantAndProperty", "agentDetails", "agentName"]],
  },
  agentAddress: {
    key: "agentAddress",
    label: "Agent Address",
    paths: [["applicantAndProperty", "agentDetails", "agentAddress"]],
  },
  agentContactEmailPhone: {
    key: "agentContactEmailPhone",
    label: "Agent Contact",
    paths: [["applicantAndProperty", "agentDetails", "agentContactEmailPhone"]],
  },
  hasPreviousCouncilApplication: {
    key: "hasPreviousCouncilApplication",
    label: "Have you previously applied to the council?",
    paths: [
      ["applicantAndProperty", "councilApplicationHistory", "hasPreviousCouncilApplication"],
    ],
  },
  previousProposalDetails: {
    key: "previousProposalDetails",
    label:
      "What was previously proposed, and was it approved, refused, or withdrawn?",
    paths: [["applicantAndProperty", "councilApplicationHistory", "previousProposalDetails"]],
  },
  planningReferenceNumber: {
    key: "planningReferenceNumber",
    label: "Planning Reference Number",
    paths: [["applicantAndProperty", "councilApplicationHistory", "planningReferenceNumber"]],
  },
  previousApplicationType: {
    key: "previousApplicationType",
    label: "Type of Application",
    paths: [["applicantAndProperty", "councilApplicationHistory", "previousApplicationType"]],
  },
  previousDevelopmentType: {
    key: "previousDevelopmentType",
    label: "Type of Development Previously Proposed",
    paths: [["applicantAndProperty", "councilApplicationHistory", "previousDevelopmentType"]],
  },
  projectComparison: {
    key: "projectComparison",
    label: "Is this project similar to the previous application or different this time?",
    paths: [["applicantAndProperty", "councilApplicationHistory", "projectComparison"]],
  },
  propertyType: {
    key: "propertyType",
    label: "Property Type",
    paths: [["applicantAndProperty", "propertyAndOwnership", "propertyType"]],
  },
  ownershipStatus: {
    key: "ownershipStatus",
    label: "Ownership Status",
    paths: [["applicantAndProperty", "propertyAndOwnership", "ownershipStatus"]],
  },
  purposeOfDevelopment: {
    key: "purposeOfDevelopment",
    label: "Are you planning any building works?",
    paths: [["applicantAndProperty", "propertyAndOwnership", "purposeOfDevelopment"]],
    mode: "array",
  },
  previouslyExtended: {
    key: "previouslyExtended",
    label: "Has the property already been extended before?",
    paths: [["applicantAndProperty", "propertyAndOwnership", "previouslyExtended"]],
  },
  currentUseStatus: {
    key: "currentUseStatus",
    label: "How is the property currently used?",
    paths: [["applicantAndProperty", "propertyAndOwnership", "currentUseStatus"]],
  },
  currentOccupantsCount: {
    key: "currentOccupantsCount",
    label: "How many people currently live there?",
    paths: [["applicantAndProperty", "propertyAndOwnership", "currentOccupantsCount"]],
  },
  currentHouseholdArrangement: {
    key: "currentHouseholdArrangement",
    label: "Are they one family or separate households?",
    paths: [["applicantAndProperty", "propertyAndOwnership", "currentHouseholdArrangement"]],
  },
  plannedOccupantsCount: {
    key: "plannedOccupantsCount",
    label: "How many occupants do you plan to accommodate?",
    paths: [["applicantAndProperty", "propertyAndOwnership", "plannedOccupantsCount"]],
  },
  sharedKitchenBathroom: {
    key: "sharedKitchenBathroom",
    label: "Will occupants share kitchen/bathroom?",
    paths: [["applicantAndProperty", "propertyAndOwnership", "sharedKitchenBathroom"]],
  },
  roomsRentedIndividually: {
    key: "roomsRentedIndividually",
    label: "Will rooms be rented individually?",
    paths: [["applicantAndProperty", "propertyAndOwnership", "roomsRentedIndividually"]],
  },
  availableBedroomsCount: {
    key: "availableBedroomsCount",
    label: "Number of bedrooms available?",
    paths: [["worksAndMaterials", "roomLayoutCheck", "availableBedroomsCount"]],
  },
  bathroomsOrShowerRoomsCount: {
    key: "bathroomsOrShowerRoomsCount",
    label: "Number of bathrooms / shower rooms?",
    paths: [["worksAndMaterials", "roomLayoutCheck", "bathroomsOrShowerRoomsCount"]],
  },
  hasCommunalKitchen: {
    key: "hasCommunalKitchen",
    label: "Is there a communal kitchen?",
    paths: [["worksAndMaterials", "roomLayoutCheck", "hasCommunalKitchen"]],
  },
  loungeDiningRoomAsBedroom: {
    key: "loungeDiningRoomAsBedroom",
    label: "Is any lounge/dining room proposed as a bedroom?",
    paths: [["worksAndMaterials", "roomLayoutCheck", "loungeDiningRoomAsBedroom"]],
  },
  smallestBedroomSize: {
    key: "smallestBedroomSize",
    label: "Approx smallest bedroom size?",
    paths: [["worksAndMaterials", "roomLayoutCheck", "smallestBedroomSize"]],
  },
  proposedWorksDescription: {
    key: "proposedWorksDescription",
    label: "Description of Proposed Works",
    paths: [
      ["worksAndMaterials", "descriptionOfWorks", "propsedWorksDescription"],
      ["worksAndMaterials", "descriptionOfWorks", "proposedWorksDescription"],
    ],
  },
  existingPropertyWidthM: {
    key: "existingPropertyWidthM",
    label: "Existing Property Width (m)",
    paths: [["worksAndMaterials", "descriptionOfWorks", "existingPropertyWidthM"]],
  },
  existingPropertyDepthM: {
    key: "existingPropertyDepthM",
    label: "Existing Property Depth (m)",
    paths: [
      ["worksAndMaterials", "descriptionOfWorks", "existingPropertyDepthM"],
      ["worksAndMaterials", "descriptionOfWorks", "existingPropertyHeightM"],
    ],
  },
  proposedExtensionWidthM: {
    key: "proposedExtensionWidthM",
    label: "Proposed Extension Width (m)",
    paths: [["worksAndMaterials", "descriptionOfWorks", "proposedExtensionWidthM"]],
  },
  proposedExtensionDepthM: {
    key: "proposedExtensionDepthM",
    label: "Proposed Extension Depth (m)",
    paths: [
      ["worksAndMaterials", "descriptionOfWorks", "proposedExtensionDepthM"],
      ["worksAndMaterials", "descriptionOfWorks", "proposedExtensionHeightM"],
    ],
  },
  ridgeOrEavesHeightM: {
    key: "ridgeOrEavesHeightM",
    label: "Ridge / Eaves Height (m)",
    paths: [["worksAndMaterials", "descriptionOfWorks", "ridgeOrEavesHeightM"]],
  },
  distanceFromBoundaryM: {
    key: "distanceFromBoundaryM",
    label: "Distance from Boundary (m)",
    paths: [["worksAndMaterials", "descriptionOfWorks", "distanceFromBoundaryM"]],
  },
  totalInternalFloorArea: {
    key: "totalInternalFloorArea",
    label: "Total internal floor area (m²)",
    paths: [
      ["worksAndMaterials", "propertyOverview", "totalInternalFloorAreaM2"],
      ["worksAndMaterials", "propertyOverview", "totalInternalFloorArea"],
    ],
  },
  numberOfFloors: {
    key: "numberOfFloors",
    label: "Number of floors (G / 1st / Loft / Basement)",
    paths: [["worksAndMaterials", "propertyOverview", "numberOfFloors"]],
  },
  propertyFootprint: {
    key: "propertyFootprint",
    label: "Property footprint (approx length × width in metres)",
    paths: [["worksAndMaterials", "propertyOverview", "propertyFootprint"]],
  },
  gardenDepth: {
    key: "gardenDepth",
    label: "Garden depth (metres)",
    paths: [
      ["worksAndMaterials", "propertyOverview", "gardenDepthM"],
      ["worksAndMaterials", "propertyOverview", "gardenDepth"],
    ],
  },
  plotWidth: {
    key: "plotWidth",
    label: "Plot width (metres)",
    paths: [
      ["worksAndMaterials", "propertyOverview", "plotWidthM"],
      ["worksAndMaterials", "propertyOverview", "plotWidth"],
    ],
  },
  kitchenRoomLengthM: {
    key: "kitchenRoomLengthM",
    label: "Kitchen Room Length (metres)",
    paths: [["worksAndMaterials", "roomDimensions", "kitchenRoomLengthM"]],
  },
  kitchenRoomWidthM: {
    key: "kitchenRoomWidthM",
    label: "Kitchen Room Width (metres)",
    paths: [["worksAndMaterials", "roomDimensions", "kitchenRoomWidthM"]],
  },
  bathroomRoomLengthM: {
    key: "bathroomRoomLengthM",
    label: "Bathroom Room Length (metres)",
    paths: [["worksAndMaterials", "roomDimensions", "bathroomRoomLengthM"]],
  },
  bathroomRoomWidthM: {
    key: "bathroomRoomWidthM",
    label: "Bathroom Room Width (metres)",
    paths: [["worksAndMaterials", "roomDimensions", "bathroomRoomWidthM"]],
  },
  wallMaterials: {
    key: "wallMaterials",
    label: "Wall Materials",
    paths: [["worksAndMaterials", "materials", "wallMaterials"]],
  },
  roofMaterials: {
    key: "roofMaterials",
    label: "Roof Materials",
    paths: [["worksAndMaterials", "materials", "roofMaterials"]],
  },
  colourOrFinishNotes: {
    key: "colourOrFinishNotes",
    label: "Colour / Finish Notes (optional)",
    paths: [["worksAndMaterials", "materials", "colourOrFinishNotes"]],
  },
  materialsMatchExisting: {
    key: "materialsMatchExisting",
    label: "Materials match existing?",
    paths: [["worksAndMaterials", "materials", "materialsMatchExisting"]],
  },
  nearConservationAreaOrListedBuilding: {
    key: "nearConservationAreaOrListedBuilding",
    label: "Conservation Area or Near Listed Building?",
    paths: [
      ["applicantAndProperty", "propertyAndOwnership", "nearConservationAreaOrListedBuilding"],
      ["siteConstraints", "heritageAndListing", "conservationAreaOrNearListedBuilding"],
    ],
  },
  isListedBuilding: {
    key: "isListedBuilding",
    label: "Is the property a Listed Building?",
    paths: [
      ["siteConstratints", "heritageAndListing", "isListedBuilding"],
      ["siteConstraints", "heritageAndListing", "isListedBuilding"],
    ],
  },
  isInConservationArea: {
    key: "isInConservationArea",
    label: "Conservation Area?",
    paths: [
      ["siteConstratints", "heritageAndListing", "isInConservationArea"],
      ["siteConstraints", "heritageAndListing", "isInConservationArea"],
    ],
  },
  newOrAlteredAccess: {
    key: "newOrAlteredAccess",
    label: "New or altered vehicle access?",
    paths: [
      ["siteConstratints", "accessAndParking", "newOrAlteredAccess"],
      ["siteConstraints", "accessAndParking", "newOrAlteredAccess"],
    ],
  },
  accessOrParkingChanges: {
    key: "accessOrParkingChanges",
    label: "Details of Access / Parking Changes",
    paths: [
      ["siteConstratints", "accessAndParking", "accessOrParkingChanges"],
      ["siteConstraints", "accessAndParking", "accessOrParkingChanges"],
    ],
  },
  proposedParkingSpaces: {
    key: "proposedParkingSpaces",
    label: "Number of Proposed Parking Spaces",
    paths: [
      ["siteConstratints", "accessAndParking", "proposedParkingSpaces"],
      ["siteConstraints", "accessAndParking", "proposedParkingSpaces"],
    ],
  },
  cycleStorageProvisions: {
    key: "cycleStorageProvisions",
    label: "Cycle storage provided?",
    paths: [
      ["siteConstratints", "accessAndParking", "cycleStorageProvisions"],
      ["siteConstraints", "accessAndParking", "cycleStorageProvisions"],
    ],
  },
  treesWithTPO: {
    key: "treesWithTPO",
    label: "Trees with TPO on or near site?",
    paths: [
      ["siteConstratints", "treesHedgesLandscaping", "treesWithTPO"],
      ["siteConstraints", "treesHedgesLandscaping", "treesWithTPO"],
    ],
  },
  treesWithinFallingDistance: {
    key: "treesWithinFallingDistance",
    label: "Trees within falling distance of works?",
    paths: [
      ["siteConstratints", "treesHedgesLandscaping", "treesWithinFallingDistance"],
      ["siteConstraints", "treesHedgesLandscaping", "treesWithinFallingDistance"],
    ],
  },
  treeSpecies: {
    key: "treeSpecies",
    label: "Tree Species (if known)",
    paths: [
      ["siteConstratints", "treesHedgesLandscaping", "treeSpecies"],
      ["siteConstraints", "treesHedgesLandscaping", "treeSpecies"],
    ],
  },
  approximateTreeSizeM: {
    key: "approximateTreeSizeM",
    label: "Approximate Tree Height (m)",
    paths: [
      ["siteConstratints", "treesHedgesLandscaping", "approximateTreeSizeM"],
      ["siteConstraints", "treesHedgesLandscaping", "approximateTreeSizeM"],
    ],
  },
  isSiteInFloodRiskArea: {
    key: "isSiteInFloodRiskArea",
    label: "Is the site in Flood Zone 2 or 3?",
    paths: [
      ["siteConstratints", "floodAndEnvironmentalRisk", "isSiteInFloodRiskArea"],
      ["siteConstraints", "floodAndEnvironmentalRisk", "isSiteInFloodRiskArea"],
    ],
  },
  isSiteContaminatedLand: {
    key: "isSiteContaminatedLand",
    label: "Any known contamination on site?",
    paths: [
      ["siteConstratints", "floodAndEnvironmentalRisk", "isSiteContaminatedLand"],
      ["siteConstraints", "floodAndEnvironmentalRisk", "isSiteContaminatedLand"],
    ],
  },
  soughtPreAppAdvice: {
    key: "soughtPreAppAdvice",
    label: "Has pre-application advice been sought?",
    paths: [
      ["siteConstratints", "preApplicationAdvice", "soughtPreAppAdvice"],
      ["siteConstraints", "preApplicationAdvice", "soughtPreAppAdvice"],
    ],
  },
  preApplicationReferenceNumber: {
    key: "preApplicationReferenceNumber",
    label: "Pre-Application Reference Number",
    paths: [
      ["siteConstratints", "preApplicationAdvice", "preApplicationReferenceNumber"],
      ["siteConstraints", "preApplicationAdvice", "preApplicationReferenceNumber"],
    ],
  },
  dateOfPreAppAdvice: {
    key: "dateOfPreAppAdvice",
    label: "Date of Pre-App Advice",
    paths: [
      ["siteConstratints", "preApplicationAdvice", "dateOfPreAppAdvice"],
      ["siteConstraints", "preApplicationAdvice", "dateOfPreAppAdvice"],
    ],
    format: "date",
  },
  officerName: {
    key: "officerName",
    label: "Officer Name",
    paths: [
      ["siteConstratints", "preApplicationAdvice", "officerName"],
      ["siteConstraints", "preApplicationAdvice", "officerName"],
    ],
  },
  preApplicationAdviceSummary: {
    key: "preApplicationAdviceSummary",
    label: "Summary of Pre-App Advice Received",
    paths: [
      ["siteConstratints", "preApplicationAdvice", "preApplicationAdviceSummary"],
      ["siteConstraints", "preApplicationAdvice", "preApplicationAdviceSummary"],
    ],
  },
  smokeAlarmsInstalled: {
    key: "smokeAlarmsInstalled",
    label: "Do you currently have smoke alarms installed?",
    paths: [
      ["utilitesAndConsents", "safetyAndCompliance", "smokeAlarmsInstalled"],
      ["utilitiesAndConsents", "safetyAndCompliance", "smokeAlarmsInstalled"],
    ],
  },
  gasSafetyCertificate: {
    key: "gasSafetyCertificate",
    label: "Do you have a valid Gas Safety Certificate?",
    paths: [
      ["utilitesAndConsents", "safetyAndCompliance", "gasSafetyCertificate"],
      ["utilitiesAndConsents", "safetyAndCompliance", "gasSafetyCertificate"],
    ],
  },
  electricalReportEicr: {
    key: "electricalReportEicr",
    label: "Do you have a valid Electrical Report (EICR)?",
    paths: [
      ["utilitesAndConsents", "safetyAndCompliance", "electricalReportEicr"],
      ["utilitiesAndConsents", "safetyAndCompliance", "electricalReportEicr"],
    ],
  },
  epcAvailable: {
    key: "epcAvailable",
    label: "EPC available?",
    paths: [
      ["utilitesAndConsents", "safetyAndCompliance", "epcAvailable"],
      ["utilitiesAndConsents", "safetyAndCompliance", "epcAvailable"],
    ],
  },
  waterSupply: {
    key: "waterSupply",
    label: "Water Supply",
    paths: [
      ["utilitesAndConsents", "utilitiesAndWaste", "waterSupply"],
      ["utilitiesAndConsents", "utilitiesAndWaste", "waterSupply"],
    ],
  },
  sewageOrDrainage: {
    key: "sewageOrDrainage",
    label: "Sewage / Drainage",
    paths: [
      ["utilitesAndConsents", "utilitiesAndWaste", "sewageOrDrainage"],
      ["utilitiesAndConsents", "utilitiesAndWaste", "sewageOrDrainage"],
    ],
  },
  surfaceWaterDrainage: {
    key: "surfaceWaterDrainage",
    label: "Surface Water Drainage",
    paths: [
      ["utilitesAndConsents", "utilitiesAndWaste", "surfaceWaterDrainage"],
      ["utilitiesAndConsents", "utilitiesAndWaste", "surfaceWaterDrainage"],
    ],
  },
  existingWasteArrangements: {
    key: "existingWasteArrangements",
    label: "Existing Waste Arrangements",
    paths: [
      ["utilitesAndConsents", "utilitiesAndWaste", "existingWasteArrangements"],
      ["utilitiesAndConsents", "utilitiesAndWaste", "existingWasteArrangements"],
    ],
  },
  renewableEnergyProposals: {
    key: "renewableEnergyProposals",
    label: "Renewable energy installations proposed?",
    paths: [
      ["utilitesAndConsents", "utilitiesAndWaste", "renewableEnergyProposals"],
      ["utilitiesAndConsents", "utilitiesAndWaste", "renewableEnergyProposals"],
    ],
  },
  renewableEnergyDetails: {
    key: "renewableEnergyDetails",
    label: "Details of Renewable / Energy Measures (if applicable)",
    paths: [
      ["utilitesAndConsents", "utilitiesAndWaste", "renewableEnergyDetails"],
      ["utilitiesAndConsents", "utilitiesAndWaste", "renewableEnergyDetails"],
    ],
  },
  certificateOfOwnership: {
    key: "certificateOfOwnership",
    label: "Which Ownership Certificate applies?",
    paths: [
      ["utilitesAndConsents", "ownershipCertificate", "certificateOfOwnership"],
      ["utilitiesAndConsents", "ownershipCertificate", "certificateOfOwnership"],
    ],
  },
  ownershipDetails: {
    key: "ownershipDetails",
    label: "Names & Addresses of Other Owners (if Certificate B, C or D)",
    paths: [
      ["utilitesAndConsents", "ownershipCertificate", "ownershipDetails"],
      ["utilitiesAndConsents", "ownershipCertificate", "ownershipDetails"],
    ],
  },
  additionalConsents: {
    key: "additionalConsents",
    label: "Additional Consents",
    paths: [
      ["utilitesAndConsents", "additionalConsents"],
      ["utilitiesAndConsents", "additionalConsents"],
    ],
    mode: "array",
  },
  communityConsultation: {
    key: "communityConsultation",
    label: "Community consultation undertaken?",
    paths: [
      ["utilitesAndConsents", "communityConsultation"],
      ["utilitiesAndConsents", "communityConsultation"],
    ],
  },
  informationAccurate: {
    key: "informationAccurate",
    label: "Declaration: Information accurate",
    paths: [
      ["Declarations", "reviewDeclarations", "informationAccurate"],
      ["declarations", "reviewDeclarations", "informationAccurate"],
    ],
    mode: "declaration",
  },
  authorityConfirmed: {
    key: "authorityConfirmed",
    label: "Declaration: Authority confirmed",
    paths: [
      ["Declarations", "reviewDeclarations", "authorityConfirmed"],
      ["declarations", "reviewDeclarations", "authorityConfirmed"],
    ],
    mode: "declaration",
  },
  privateRightsAcknowledged: {
    key: "privateRightsAcknowledged",
    label: "Declaration: Private rights acknowledged",
    paths: [
      ["Declarations", "reviewDeclarations", "privateRightsAcknowledged"],
      ["declarations", "reviewDeclarations", "privateRightsAcknowledged"],
    ],
    mode: "declaration",
  },
  publicDataConsent: {
    key: "publicDataConsent",
    label: "Declaration: Public data consent",
    paths: [
      ["Declarations", "reviewDeclarations", "publicDataConsent"],
      ["declarations", "reviewDeclarations", "publicDataConsent"],
    ],
    mode: "declaration",
  },
  feeAgreementAccepted: {
    key: "feeAgreementAccepted",
    label: "Declaration: Fee agreement accepted",
    paths: [
      ["Declarations", "reviewDeclarations", "feeAgreementAccepted"],
      ["declarations", "reviewDeclarations", "feeAgreementAccepted"],
    ],
    mode: "declaration",
  },
  signatoryFullName: {
    key: "signatoryFullName",
    label: "Full Name of Signatory",
    paths: [
      ["Declarations", "DigitalSignature", "signatoryFullName"],
      ["Declarations", "digitalSignature", "signatoryFullName"],
      ["declarations", "DigitalSignature", "signatoryFullName"],
      ["declarations", "digitalSignature", "signatoryFullName"],
    ],
  },
  signedDate: {
    key: "signedDate",
    label: "Date (dd/mm/yyyy)",
    paths: [
      ["Declarations", "DigitalSignature", "signedDate"],
      ["Declarations", "digitalSignature", "signedDate"],
      ["declarations", "DigitalSignature", "signedDate"],
      ["declarations", "digitalSignature", "signedDate"],
    ],
    format: "date",
  },
  signatoryCapacity: {
    key: "signatoryCapacity",
    label: "Capacity (Owner / Agent / Other)",
    paths: [
      ["Declarations", "DigitalSignature", "signatoryCapacity"],
      ["Declarations", "digitalSignature", "signatoryCapacity"],
      ["declarations", "DigitalSignature", "signatoryCapacity"],
      ["declarations", "digitalSignature", "signatoryCapacity"],
    ],
  },
}

export const eligibilityResourceMappings = {
  locationPlan: [["worksAndMaterials", "plansDrawingsPhotographs", "locationPlan"]],
  sitePlan: [["worksAndMaterials", "plansDrawingsPhotographs", "sitePlan"]],
  existingAndProposedElevations: [
    ["worksAndMaterials", "plansDrawingsPhotographs", "existingAndProposedElevations"],
  ],
  additionalDrawings: [["worksAndMaterials", "plansDrawingsPhotographs", "additionalDrawings"]],
  photographsOfSite: [["worksAndMaterials", "plansDrawingsPhotographs", "photographsOfSite"]],
  floodRiskAssessmentReport: [
    ["siteConstratints", "floodAndEnvironmentalRisk", "floodRiskAssesmentReport"],
    ["siteConstraints", "floodAndEnvironmentalRisk", "floodRiskAssesmentReport"],
    ["siteConstraints", "floodAndEnvironmentalRisk", "floodRiskAssessmentReport"],
  ],
  treeSurveyReport: [
    ["siteConstratints", "treesHedgesLandscaping", "treeSurveyReport"],
    ["siteConstraints", "treesHedgesLandscaping", "treeSurveyReport"],
  ],
} as const

export function getValueAtPath(data: unknown, path: EligibilityPath): unknown {
  let current = data

  for (const segment of path) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

export function isMeaningfulEligibilityValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === "string") return value.trim().length > 0
  if (Array.isArray(value)) return value.some((item) => isMeaningfulEligibilityValue(item))
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((item) =>
      isMeaningfulEligibilityValue(item)
    )
  }

  return true
}

export function getFirstMappedValue(
  data: unknown,
  paths: readonly EligibilityPath[]
): unknown {
  for (const path of paths) {
    const value = getValueAtPath(data, path)
    if (isMeaningfulEligibilityValue(value)) {
      return value
    }
  }

  return undefined
}

export function getEligibilityFieldValue(
  data: unknown,
  fieldKey: keyof typeof eligibilityFieldMappings
): unknown {
  return getFirstMappedValue(data, eligibilityFieldMappings[fieldKey].paths)
}

export function getEligibilityResourceValue(
  data: unknown,
  resourceKey: keyof typeof eligibilityResourceMappings
): unknown {
  return getFirstMappedValue(data, [...eligibilityResourceMappings[resourceKey]])
}

function joinMeaningfulParts(parts: unknown[]): string | undefined {
  const values = parts
    .flatMap((part) => {
      if (!isMeaningfulEligibilityValue(part)) return []
      if (Array.isArray(part)) return part
      return [part]
    })
    .map((part) => String(part).trim())
    .filter(Boolean)

  return values.length > 0 ? values.join(", ") : undefined
}

export function getEligibilityApplicantName(data: unknown): string | undefined {
  return (
    joinMeaningfulParts([
      getEligibilityFieldValue(data, "applicantFirstName"),
      getEligibilityFieldValue(data, "applicantMiddleName"),
      getEligibilityFieldValue(data, "applicantLastName"),
    ]) ??
    (getFirstMappedValue(data, [["applicantAndProperty", "applicantDetails", "fullName"]]) as
      | string
      | undefined)
  )
}

export function getEligibilitySiteAddress(data: unknown): string | undefined {
  return (
    joinMeaningfulParts([
      getEligibilityFieldValue(data, "siteAddressLine1"),
      getEligibilityFieldValue(data, "siteAddressLine2"),
      getEligibilityFieldValue(data, "postcode"),
    ]) ??
    (getFirstMappedValue(data, [["applicantAndProperty", "applicantDetails", "siteAddress"]]) as
      | string
      | undefined)
  )
}

export function getEligibilityCorrespondenceAddress(
  data: unknown
): string | undefined {
  return joinMeaningfulParts([
    getEligibilityFieldValue(data, "correspondenceAddressLine1"),
    getEligibilityFieldValue(data, "correspondenceAddressLine2"),
    getEligibilityFieldValue(data, "correspondencePostcode"),
  ])
}

export function getEligibilityAgentAddress(data: unknown): string | undefined {
  const value = getEligibilityFieldValue(data, "agentAddress")
  if (typeof value === "string") return value
  return joinMeaningfulParts([value])
}
