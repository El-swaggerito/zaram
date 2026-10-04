export const siteConfig = {
  name: "Zaram Hotels & Garden",

  navigation: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Rooms",
      href: "/rooms",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],

  contact: {
    phone: "+234 XXX XXX XXXX",
    email: "hello@zaramhotels.com",
    address: "City, State, Nigeria",
  },

  social: {
    instagram: "#",
    facebook: "#",
    whatsapp: "#",
  },
} as const;
