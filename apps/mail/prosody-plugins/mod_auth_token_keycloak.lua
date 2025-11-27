-- Custom Prosody module for JWT token authentication with Keycloak
-- This module validates JWT tokens issued by the Darevel backend (which uses Keycloak authentication)

local jwt = require "luajwt";
local json = require "cjson";
local http = require "net.http";

local app_id = module:get_option_string("app_id");
local app_secret = module:get_option_string("app_secret");
local accepted_issuers = module:get_option_set("jwt_accepted_issuers", {});
local accepted_audiences = module:get_option_set("jwt_accepted_audiences", {});

module:log("info", "JWT Token Auth module loaded with app_id: %s", app_id or "none");

local function verify_token(token)
    if not token then
        return nil, "no token provided";
    end

    -- Decode and verify JWT
    local ok, decoded = pcall(jwt.decode, token, app_secret);
    
    if not ok then
        module:log("warn", "JWT decode failed: %s", tostring(decoded));
        return nil, "invalid token";
    end

    -- Verify issuer
    if accepted_issuers and #accepted_issuers > 0 then
        local issuer = decoded.payload and decoded.payload.iss;
        if not issuer or not accepted_issuers:contains(issuer) then
            module:log("warn", "Token issuer not accepted: %s", tostring(issuer));
            return nil, "invalid issuer";
        end
    end

    -- Verify audience
    if accepted_audiences and #accepted_audiences > 0 then
        local audience = decoded.payload and decoded.payload.aud;
        if not audience then
            module:log("warn", "Token has no audience");
            return nil, "invalid audience";
        end
        
        local aud_valid = false;
        if type(audience) == "table" then
            for _, aud in ipairs(audience) do
                if accepted_audiences:contains(aud) or accepted_audiences:contains("*") then
                    aud_valid = true;
                    break;
                end
            end
        elseif accepted_audiences:contains(audience) or accepted_audiences:contains("*") then
            aud_valid = true;
        end
        
        if not aud_valid then
            module:log("warn", "Token audience not accepted: %s", tostring(audience));
            return nil, "invalid audience";
        end
    end

    -- Verify expiration
    local exp = decoded.payload and decoded.payload.exp;
    if exp and os.time() > exp then
        module:log("warn", "Token expired");
        return nil, "token expired";
    end

    -- Extract user info from context
    local context = decoded.payload and decoded.payload.context;
    local user_info = context and context.user;
    
    if not user_info or not user_info.id then
        module:log("warn", "Token missing user info");
        return nil, "invalid user info";
    end

    module:log("info", "Token verified for user: %s (%s)", user_info.name or "unknown", user_info.id);
    
    return {
        jid = user_info.id .. "@" .. module.host,
        name = user_info.name,
        email = user_info.email,
        avatar = user_info.avatar,
        room = decoded.payload.room
    };
end

-- Hook into Prosody authentication
function module.load()
    module:log("info", "JWT Token Auth with Keycloak support loaded");
end

function module.unload()
    module:log("info", "JWT Token Auth module unloaded");
end

return {
    verify_token = verify_token
};
