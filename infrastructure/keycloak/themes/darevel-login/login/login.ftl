<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${msg("loginTitle", realm.displayName!"Darevel")}</title>
    <link rel="stylesheet" href="${url.resourcesPath}/css/darevel-login.css" />
</head>
<body class="theme-darevel-login">
    <div class="darevel-login-wrapper">
        <div class="darevel-brand">DAREVEL</div>
        <h1>Welcome back</h1>
        <p class="darevel-subtitle">Sign in to continue with your Darevel workspace</p>

        <div class="darevel-alerts">
            <#if message?has_content>
                <div class="pf-c-alert pf-m-${message.type}">
                    <span>${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </#if>
        </div>

        <form id="kc-form-login" action="${url.loginAction}" method="post">

            <div class="darevel-form-group">
                <label for="username" class="darevel-label">Email</label>
                  <input tabindex="1" id="username" class="darevel-input" name="username" type="text"
                      value="${login.username!}" autocomplete="username" autofocus />
                <#if messagesPerField?has_content && messagesPerField['username']??>
                    <small class="pf-c-alert pf-m-inline pf-m-danger">${messagesPerField['username']}</small>
                </#if>
            </div>

            <div class="darevel-form-group">
                <label for="password" class="darevel-label">Password</label>
                <input tabindex="2" id="password" class="darevel-input" name="password" type="password" autocomplete="current-password" />
                <#if messagesPerField?has_content && messagesPerField['password']??>
                    <small class="pf-c-alert pf-m-inline pf-m-danger">${messagesPerField['password']}</small>
                </#if>
            </div>

            <#if realm.rememberMe && !usernameEditDisabled??>
                <div class="darevel-form-group" style="display:flex;align-items:center;gap:0.5rem;">
                    <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if> />
                    <label for="rememberMe" class="darevel-label" style="text-transform:none;letter-spacing:normal; margin-bottom:0;">Remember me</label>
                </div>
            </#if>

            <button tabindex="4" class="darevel-submit" type="submit">Sign in</button>
        </form>

        <div class="darevel-help">
            <#if realm.resetPasswordAllowed>
                <a href="${url.loginResetCredentialsUrl}">Forgot password?</a>
            </#if>
        </div>
    </div>
</body>
</html>
