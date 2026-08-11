// Single source of truth for product "types" sold on Kartikeyo, used by the
// admin product form and the storefront (shop filters, product page).
//
// Mirrors the backend copy at:
//   Kartikeyo-backend/config/productTaxonomy.js
// Keep both in sync when you add a new product type (e.g. "puja-samagri").
//
// value           -> stored in Product.productType
// label           -> shown in UI
// icon            -> small emoji used in nav/category strips
// categories      -> options offered for Product.category when this type is selected
// hasVariants     -> whether a variant selector (size/height/mukhi) is typically needed
// variantLabel    -> what to call that selector
// variantOptions  -> quick-pick suggestions (admin can still type a custom value)
// attributeSuggestions -> quick-pick labels for the Specifications section

export const PRODUCT_TYPES = [
  {
    value: "clothing",
    label: "Clothing",
    icon: "👕",
    categories: ["T-Shirt", "Hoodie", "Tote Bag"],
    hasVariants: true,
    variantLabel: "Size",
    variantOptions: ["S", "M", "L", "XL", "XXL"],
    attributeSuggestions: ["Fabric", "Fit", "Print Type", "Care Instructions"],
  },
  {
    value: "murti",
    label: "Murti & Idols",
    icon: "🕉️",
    categories: [
      "Shiv Ling",
      "Ganesh Murti",
      "Krishna Murti",
      "Hanuman Murti",
      "Durga Murti",
      "Radha Krishna",
      "Other Murti",
    ],
    hasVariants: true,
    variantLabel: "Height",
    variantOptions: ["3 inch", "4 inch", "6 inch", "9 inch", "12 inch", "18 inch", "24 inch"],
    attributeSuggestions: ["Material", "Finish", "Weight", "Hand-carved"],
  },
  {
    value: "rudraksha",
    label: "Rudraksha & Mala",
    icon: "📿",
    categories: ["Rudraksha Bead", "Rudraksha Mala", "Rudraksha Bracelet", "Gemstone Mala"],
    hasVariants: true,
    variantLabel: "Mukhi",
    variantOptions: [
      "1 Mukhi", "2 Mukhi", "3 Mukhi", "4 Mukhi", "5 Mukhi", "6 Mukhi",
      "7 Mukhi", "8 Mukhi", "9 Mukhi", "10 Mukhi", "11 Mukhi", "12 Mukhi",
      "13 Mukhi", "14 Mukhi", "Gauri Shankar", "Ganesh Rudraksha",
    ],
    attributeSuggestions: ["Origin", "Bead Size (mm)", "Thread Type", "Lab Certified"],
  },
  {
    value: "book",
    label: "Puja Books",
    icon: "📖",
    categories: ["Chalisa", "Aarti Sangrah", "Vrat Katha", "Bhagavad Gita", "Ramayan", "Other Book"],
    hasVariants: false,
    variantLabel: "Edition",
    variantOptions: [],
    attributeSuggestions: ["Language", "Author", "Publisher", "Pages", "Binding"],
  },
  {
    value: "accessory",
    label: "Puja Accessories",
    icon: "🪔",
    categories: ["Puja Thali", "Incense & Dhoop", "Diya", "Kalash", "Bell (Ghanti)", "Other Accessory"],
    hasVariants: false,
    variantLabel: "Variant",
    variantOptions: [],
    attributeSuggestions: ["Material", "Set Includes"],
  },
];

export const DEFAULT_PRODUCT_TYPE = PRODUCT_TYPES[0].value;

export function getProductTypeConfig(value) {
  return PRODUCT_TYPES.find((t) => t.value === value) || PRODUCT_TYPES[0];
}

// Flat list of every category across every type — used by the shop page
// when no type filter is active yet.
export const ALL_CATEGORIES = PRODUCT_TYPES.flatMap((t) => t.categories);
