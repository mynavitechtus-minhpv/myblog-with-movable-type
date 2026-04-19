FROM perl:5.38-bookworm

LABEL maintainer="dev"
LABEL description="Movable Type 8.8.2 local development"

# Tránh interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Cài đặt system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    apache2 \
    libapache2-mod-perl2 \
    default-libmysqlclient-dev \
    libgd-dev \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libxml2-dev \
    libexpat1-dev \
    libssl-dev \
    imagemagick \
    libmagickcore-dev \
    libmagickwand-dev \
    perlmagick \
    curl \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Perl modules - batch 1: stable core
RUN cpanm --notest \
    DBI \
    DBD::MariaDB \
    DBD::mysql@4.050 \
    CGI \
    Image::Size \
    JSON \
    Archive::Zip \
    Archive::Tar \
    IO::Compress::Gzip \
    IO::Uncompress::Gunzip \
    HTML::Entities \
    HTML::Parser \
    IPC::Run \
    Storable

# Perl modules - batch 2: XML / YAML (need system libs)
RUN cpanm --notest \
    XML::Parser \
    XML::SAX \
    YAML::Syck

# Perl modules - batch 3: SSL / network
RUN cpanm --notest \
    Net::SSLeay \
    IO::Socket::SSL \
    LWP::UserAgent \
    LWP::Protocol::https

# Perl modules - batch 4: image processing
RUN cpanm --notest Imager

# Optional modules (fail OK for local dev)
RUN cpanm --notest \
    XML::SAX::Expat \
    Digest::SHA1 \
    Digest::SHA \
    CGI::Parse::PSGI \
    XMLRPC::Transport::HTTP::Plack \
    Authen::SASL \
    Cache::Memcached \
    GD \
    ; echo "Optional modules done (some may have been skipped)"

# Apache config: enable CGI
# Dùng mod_cgi (không dùng cgid để tránh socket issues khi restart)
RUN a2dismod cgid 2>/dev/null; a2enmod cgi rewrite headers

# Apache site config cho MT
RUN cat > /etc/apache2/sites-available/mt.conf << 'APACHE_CONF'
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /var/www/html/site

    # MT CGI directory
    ScriptAlias /cgi-bin/mt/ /var/www/cgi-bin/mt/
    <Directory /var/www/cgi-bin/mt/>
        Options +ExecCGI
        AddHandler cgi-script .cgi
        AllowOverride None
        Require all granted
    </Directory>

    # MT Static files
    Alias /mt-static/ /var/www/cgi-bin/mt/mt-static/
    <Directory /var/www/cgi-bin/mt/mt-static/>
        Options -ExecCGI
        AllowOverride None
        Require all granted
    </Directory>

    # Published site
    <Directory /var/www/html/site/>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
APACHE_CONF

RUN a2dissite 000-default && a2ensite mt

# Tạo directories
RUN mkdir -p /var/www/cgi-bin/mt \
    /var/www/html/site \
    /var/www/html/mt-static

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
