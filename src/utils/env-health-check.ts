const envNameArray = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_DATABASENAME",
  "QUIZ_LIMIT",
  "MACROTOPIC_ARRAY_LIMIT",
  "MICROTOPIC_ARRAY_LIMIT",
  "AUTH_PORT",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "FE_DOMAIN",
  "MAX_DEVICES_PER_USER",
  "COOKIE_MAX_AGE_MS",
  "RT_MAX_AGE",
  "AT_MAX_AGE"
];

export default function envHealthChecker() {
  const somethingIsNull = envNameArray.reduce((prev, current) => {
    return prev && !!process.env[current];
  }, true);

  if (!somethingIsNull) {
    throw new Error(
      "Errore nel caricamento delle variabili di ambiente controlla ci siano tutte! "
    );
  }
}
