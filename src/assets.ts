// Local copies of the Figma-exported assets (served from /public/assets)
const icon = (name: string) => `/assets/icons/${name}.svg`;

export const icons = {
  badgeDotSolid: icon("badge-dot-solid"),
  badgeDotNegative: icon("badge-dot-negative"),
  badgeDotPositive: icon("badge-dot-positive"),
  chevronLeft: icon("chevron-left"),
  chevronRight: icon("chevron-right"),
  chevronDown: icon("chevron-down"),
  chevronRightMuted: icon("chevron-right-muted"),
  switchOff: icon("switch-off"),
  accountChevron: icon("account-chevron"),
  mic: icon("mic"),
  server: icon("server"),
  chevronsUpDown: icon("chevrons-up-down"),
  bellRing: icon("bell-ring"),
  navHome: icon("nav-home"),
  navEvents: icon("nav-events"),
  navDeviceStatus: icon("nav-device-status"),
  navDeviceConfig: icon("nav-device-config"),
  navSettings: icon("nav-settings"),
  search: icon("search"),
  clock: icon("clock"),
  camera: icon("camera"),
  user: icon("user"),
  save: icon("save"),
  presentation: icon("presentation"),
  copyX: icon("copy-x"),
  layoutGrid: icon("layout-grid"),
  maximize: icon("maximize"),
  x: icon("x"),
  plus: icon("plus"),
  undo: icon("undo"),
  toastUndo: icon("toast-undo"),
  styleLayout: icon("style-layout"),
  star: icon("star"),
  bell: icon("bell"),
  accountChevron16: icon("account-chevron-16"),
};

export const noPermissionIllustration = "/assets/images/illustration-no-permission.png";

export const logoMark = "/assets/images/logo-mark.png";
export const cameraFeeds = Array.from({ length: 9 }, (_, i) => `/assets/images/camera-0${i + 1}.jpg`);
