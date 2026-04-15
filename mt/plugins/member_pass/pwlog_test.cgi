#!/usr/bin/perl

#┌─────────────────────────────────
#│ PasswordManager : pwlog_test.cgi (SSI用) - 2011/07/21
#│ Copyright (c) KentWeb
#│ http://www.kent-web.com/
#└─────────────────────────────────
# 【使い方】ログイン後のHTMLページに以下のSSIタグを記述
#  <!--#exec cgi="/パス/pwlog_test.cgi"-->
#
# 【利用条件】
#  1. SSIの利用できるサーバ
#  2. 環境変数 $ENV{'REMOTE_USER'} にてユーザーIDが取得できること

print "Content-type: text/plain\n\n";
print "ユーザーID表\示テスト → $ENV{REMOTE_USER}\n";

