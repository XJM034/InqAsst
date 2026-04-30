type NavigateOptions = {
  replace?: boolean;
};

export function navigateTo(href: string, options: NavigateOptions = {}) {
  if (typeof window === "undefined") {
    return;
  }

  if (options.replace) {
    window.location.replace(href);
    return;
  }

  window.location.assign(href);
}

export function reloadPage() {
  if (typeof window === "undefined") {
    return;
  }

  window.location.reload();
}
