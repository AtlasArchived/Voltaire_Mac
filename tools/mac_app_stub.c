/* Tiny Mach-O entry for .app bundles. macOS often ignores script-only CFBundleExecutable. */
#include <mach-o/dyld.h>
#include <libgen.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#if VOLTAIRE
#define SCRIPT "voltaire-launch.sh"
#else
#define SCRIPT "stop-launch.sh"
#endif

int main(void) {
  char raw[PATH_MAX];
  uint32_t sz = sizeof(raw);
  if (_NSGetExecutablePath(raw, &sz) != 0) return 111;

  char *dup = strdup(raw);
  if (!dup) return 112;
  char *dir = dirname(dup);
  char path[PATH_MAX];
  int n = snprintf(path, sizeof(path), "%s/%s", dir, SCRIPT);
  free(dup);
  if (n <= 0 || (size_t)n >= sizeof(path)) return 113;

  execl("/bin/bash", "bash", path, (char *)NULL);
  perror("Voltaire");
  return 114;
}
