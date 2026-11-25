plugins {
    java
    id("org.springframework.boot") version "4.2.0"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.diffplug.spotless") version "8.12.0"
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

spotless {
    java {
        palantirJavaFormat()
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-liquibase")
    runtimeOnly("org.postgresql:postgresql")
    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:testcontainers-postgresql")
    testImplementation("org.testcontainers:testcontainers-junit-jupiter")
}

tasks.test {
    useJUnitPlatform()
}

tasks.bootJar {
    archiveFileName = "brewlog.jar"
}

tasks.jar {
    enabled = false
}
