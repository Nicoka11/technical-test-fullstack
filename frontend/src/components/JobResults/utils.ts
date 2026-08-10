import { ContractType } from "../../types";

export const getContractTypeLabel = (contractType: ContractType): string => {
  switch (contractType) {
    case "FULL_TIME":
      return "Full Time";
    case "PART_TIME":
      return "Part Time";
    case "TEMPORARY":
      return "Temporary";
    case "FREELANCE":
      return "Freelance";
    case "INTERNSHIP":
      return "Internship";
    case "APPRENTICESHIP":
      return "Apprenticeship";
    case "VIE":
      return "VIE";
    default:
      return contractType;
  }
};
