# Dockerfile
# see https://hub.docker.com/_/php for configuration
FROM php:8-apache

MAINTAINER Max Starikov <maxim.starikov@gmail.com>

RUN a2enmod rewrite

#install mysqli
RUN docker-php-ext-install -j$(nproc) mysqli

#install gd
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libgmp-dev libpng-dev git mc nano \
    && docker-php-ext-install gmp \
    && docker-php-ext-install -j$(nproc) iconv 

# install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer