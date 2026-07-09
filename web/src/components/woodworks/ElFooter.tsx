import { getTranslations } from "next-intl/server";
import { FacebookIcon, PinterestIcon, TwitterIcon } from "./icons";

const SOCIALS = [
  { key: "facebook", Icon: FacebookIcon },
  { key: "pinterest", Icon: PinterestIcon },
  { key: "twitter", Icon: TwitterIcon },
] as const;

/**
 * Element footer — centred social icons (monochrome muted, hover accent +
 * translateY(-3px)) above the copyright line. Icons are placeholder links ("#")
 * until real accounts are confirmed.
 */
export async function ElFooter() {
  const t = await getTranslations("element.footer");

  return (
    <footer className="px-6 pb-10 pt-2 nav:mx-auto nav:w-[1200px] nav:px-0">
      <ul className="mb-[22px] flex items-center justify-center gap-[26px] nav:mb-6">
        {SOCIALS.map(({ key, Icon }) => (
          <li key={key}>
            <a
              href="#"
              aria-label={t(`social.${key}` as never)}
              className="inline-flex text-[color:var(--el-text-muted)] transition-[color,transform] duration-300 hover:-translate-y-[3px] hover:text-[color:var(--el-accent)]"
            >
              <Icon width={22} height={22} />
            </a>
          </li>
        ))}
      </ul>
      <p className="text-center text-[12.5px] tracking-[0.5px] text-[color:var(--el-text-muted)] nav:text-[13px]">
        {t("copyright")}
      </p>
    </footer>
  );
}
