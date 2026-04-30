import { forwardRef, type ComponentPropsWithoutRef } from "react";

type StaticLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
};

export const StaticLink = forwardRef<HTMLAnchorElement, StaticLinkProps>(
  function StaticLink({ href, ...props }, ref) {
    return <a ref={ref} href={href} {...props} />;
  },
);
