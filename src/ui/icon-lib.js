/* Thư viện biểu tượng Font Awesome: chỉ đóng gói các biểu tượng thật sự dùng.
   Chuỗi HTML dùng thẻ <i class="fa-…"> (đổi thành SVG bằng dom.i2svg); component Preact dùng <Icon> trong notebook.js. */
import { config, library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft, faArrowRight, faBookOpen, faCheck, faChevronLeft, faChevronRight,
  faCircleCheck, faCircleQuestion, faCircleXmark, faComments, faFileCircleCheck,
  faFileLines, faFolderOpen, faForward, faGavel, faHeart, faHourglassEnd,
  faLink, faLocationDot, faLock, faMagnifyingGlass, faRotateLeft, faRotateRight, faTableCells,
  faTriangleExclamation, faTrophy, faUserSecret, faVideo, faXmark,
  faCity, faDeleteLeft, faHourglassHalf, faLandmark, faLightbulb, faLockOpen,
  faDoorOpen, faMapLocationDot, faPen, faStar, faExpand, faCompress
} from "@fortawesome/free-solid-svg-icons";
import { faClock, faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

config.autoAddCss = false;
library.add(
  faArrowLeft, faArrowRight, faBookOpen, faCheck, faChevronLeft, faChevronRight,
  faCircleCheck, faCircleQuestion, faCircleXmark, faComments, faFileCircleCheck,
  faFileLines, faFolderOpen, faForward, faGavel, faHeart, faHourglassEnd,
  faLink, faLocationDot, faLock, faMagnifyingGlass, faRotateLeft, faRotateRight, faTableCells,
  faTriangleExclamation, faTrophy, faUserSecret, faVideo, faXmark,
  faCity, faDeleteLeft, faHourglassHalf, faLandmark, faLightbulb, faLockOpen,
  faDoorOpen, faMapLocationDot, faPen, faStar, faExpand, faCompress,
  faClock, faStarRegular
);
