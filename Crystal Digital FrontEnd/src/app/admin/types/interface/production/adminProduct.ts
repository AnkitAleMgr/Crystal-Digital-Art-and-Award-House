export interface AdminProduct {
  id: string;
  name: string;
  desc: string;
  fullDesc: string;
  cat: string;
  features: string[];
  specs: { label: string; value: string }[];
  customizable: string[];
  tags: string[];
  sizes: string[];
  imgUrl: string;
}