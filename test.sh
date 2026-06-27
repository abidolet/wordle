#!/bin/bash

random_email="$(openssl rand -hex 12)@test.com"
random_password="Test1234!"

function register()
{
	curl -k -X POST https://localhost:8443/auth/register \
	-H "Content-Type: application/json" \
	-d '{"email":"'"$random_email"'","password":"'"$random_password"'"}'
}

function login()
{
	curl -k -X POST https://localhost:8443/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"'"$random_email"'","password":"'"$random_password"'"}'
}

function me()
{
	curl -k https://localhost:8443/auth/me \
	-H "Authorization: Bearer $1"
}

function refresh()
{
	curl -k -X POST https://localhost:8443/auth/refresh \
	-H "Content-Type: application/json" \
	-d '{"refreshToken":"'"$1"'"}'
}

function logout()
{
	curl -k -X POST https://localhost:8443/auth/logout \
	-H "Authorization: Bearer $1"
}
