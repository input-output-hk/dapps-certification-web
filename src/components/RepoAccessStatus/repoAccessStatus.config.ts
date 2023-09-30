export const ACCESS_STATUS: { [index: string]: any } = {
    verifying: {
      className: "image anim-rotate",
      "data-testid": "verifying",
      src: "/images/running.svg",
      alt: "verifying",
      color: "#DBAB0A",
    },
    accessible: {
      className: "image",
      "data-testid": "accessible",
      src: "/images/passed.svg",
      alt: "accessible",
      color: "#009168",
    },
    notAccessible: {
      className: "image",
      "data-testid": "notAccessible",
      src: "/images/failed.svg",
      alt: "not accessible",
      color: "#FF493D",
    },
  };