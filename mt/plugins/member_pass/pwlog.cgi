#!/usr/bin/perl

#┌─────────────────────────────────
#│ PasswordManager : pwlog.cgi (SSI用) - 2011/07/21
#│ Copyright (c) KentWeb
#│ http://www.kent-web.com/
#└─────────────────────────────────
# 【使い方】ログイン後のHTMLページに以下のSSIタグを記述
#  <!--#exec cgi="/パス/pwlog.cgi"-->
#
# 【利用条件】
#  1. SSIの利用できるサーバ
#  2. 環境変数 $ENV{'REMOTE_USER'} にてユーザーIDが取得できること
#  ※ 2. については、同梱の pwlog_test.cgi にてテストすること

# モジュール宣言
use strict;

# 外部ファイル取り込み
require './init.cgi';
my %cf = &init;

# ホスト名を取得
my $host = &get_host;

# 時間取得
my $date = &get_time;

# ブラウザ情報
my $agent = $ENV{HTTP_USER_AGENT};
$agent =~ s/[<>&"']//g;

# ログファイルの読み込み
open(DAT,"+< $cf{axsfile}") or die "open err: %cf{axsfile}";
eval "flock(DAT, 2);";
my @data = <DAT>;

# ログ調整
while ( $cf{log_max} <= @data ) {
	pop(@data);
}
unshift(@data,"$ENV{REMOTE_USER}<>$date<>$host<>$agent<>\n");

# 更新
seek(DAT, 0, 0);
print DAT @data;
truncate(DAT, tell(DAT));
close(DAT);

#-----------------------------------------------------------
#  ホスト名取得
#-----------------------------------------------------------
sub get_host {
	my $host = $ENV{REMOTE_HOST};
	my $addr = $ENV{REMOTE_ADDR};

	if ($cf{gethostbyaddr} && ($host eq "" || $host eq $addr)) {
		$host = gethostbyaddr(pack("C4", split(/\./, $addr)), 2);
	}
	$host ||= $addr;
	return $host;
}


