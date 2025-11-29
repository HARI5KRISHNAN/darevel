package com.darevel.preview.config;

import java.util.Collection;
import java.util.Collections;
import java.util.stream.Stream;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.oauth2.jwt.Jwt;

public class ScopeClaimConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private final SimpleAuthorityMapper authorityMapper;

    public ScopeClaimConverter(SimpleAuthorityMapper authorityMapper) {
        this.authorityMapper = authorityMapper;
    }

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Collection<String> scopes = jwt.getClaimAsStringList("scope");
        if (scopes == null || scopes.isEmpty()) {
            String singleScope = jwt.getClaimAsString("scope");
            if (singleScope == null) {
                return Collections.emptyList();
            }
            scopes = Stream.of(singleScope.split(" ")).toList();
        }
        Collection<GrantedAuthority> authorities = scopes.stream()
            .map(scope -> new SimpleGrantedAuthority(scope))
            .toList();
        return authorityMapper.mapAuthorities(authorities);
    }
}
