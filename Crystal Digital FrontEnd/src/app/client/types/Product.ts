export interface Product {
  id: string;
  img: string;
  name: string;
  desc: string;
  fullDesc: string;
  cat: string;
  features: string[];
  specs: { label: string; value: string }[];
  customizable: string[];
  tags: string[];
}