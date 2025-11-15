import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://keycloak.darevel.local",
  realm: "master",
  clientId: "chat-web"
});

export default keycloak;
