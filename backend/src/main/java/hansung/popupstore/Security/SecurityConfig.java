package hansung.popupstore.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final TokenProvider tokenProvider;

    public SecurityConfig(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider);
    }


    @Bean
    public DefaultSecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorizeHttpRequests -> authorizeHttpRequests
                                .requestMatchers("/admin/**").hasRole("ADMIN")
                                //.requestMatchers("/company/**").hasAnyRole("COMPANY", "ADMIN")
                                //.requestMatchers("/popup/company/**").hasAnyRole("COMPANY", "ADMIN")
                                .requestMatchers("/**").permitAll()

                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .logout((logout) -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/auth/logout"))
                        .logoutSuccessUrl("/")
                        .invalidateHttpSession(true)
                )
                .csrf().disable();

        return http.build();
    }

//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                // 1. CSRF 설정을 먼저 합니다.
//                .csrf(csrf -> csrf
//                        // 테스트 경로에 대한 CSRF 보호를 비활성화합니다.
//                        .ignoringRequestMatchers(new AntPathRequestMatcher("/test/**"))
//                )
//                // 2. JWT 필터를 추가합니다.
//                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
//                // 3. 세션 정책을 설정합니다. (JWT 사용 시 보통 STATELESS)
//                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                // 4. 경로별 인가(Authorization) 설정을 합니다.
//                .authorizeHttpRequests(authz -> authz
//                        // 테스트 경로는 누구나 접근 가능하도록 허용합니다.
//                        .requestMatchers("/test/**").permitAll()
//                        .requestMatchers("/admin/**").hasRole("ADMIN")
//                        .requestMatchers("/error").permitAll()
//                        // 다른 모든 요청은 일단 허용 (필요에 따라 수정)
//                        .anyRequest().permitAll()
//                )
//                // 5. 로그아웃 설정을 합니다.
//                .logout(logout -> logout
//                        .logoutRequestMatcher(new AntPathRequestMatcher("/auth/logout"))
//                        .logoutSuccessUrl("/")
//                        .invalidateHttpSession(true)
//                );
//
//        return http.build();
//    }
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}