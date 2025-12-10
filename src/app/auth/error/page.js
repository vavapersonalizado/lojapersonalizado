"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            background: '#f7fafc',
            textAlign: 'center'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</h1>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Ops! Algo deu errado.
                </h2>

                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    {error === 'Configuration' && 'Erro de configuração no servidor.'}
                    {error === 'AccessDenied' && 'Acesso negado.'}
                    {error === 'Verification' && 'O link de verificação expirou ou já foi usado.'}
                    {error === 'OAuthSignin' && 'Erro ao tentar conectar com o provedor de login.'}
                    {error === 'OAuthCallback' && 'Erro no retorno do provedor de login.'}
                    {error === 'OAuthCreateAccount' && 'Erro ao criar conta com o provedor de login.'}
                    {error === 'EmailCreateAccount' && 'Erro ao criar conta com email.'}
                    {error === 'Callback' && 'Erro no callback de autenticação.'}
                    {error === 'OAuthAccountNotLinked' && 'Este email já está associado a outra conta.'}
                    {error === 'EmailSignin' && 'Erro ao enviar email de login.'}
                    {error === 'CredentialsSignin' && 'Falha no login. Verifique suas credenciais.'}
                    {!error && 'Um erro desconhecido ocorreu.'}
                </p>

                <Link
                    href="/auth/signin"
                    className="btn btn-primary"
                    style={{ display: 'inline-block', width: '100%' }}
                >
                    Tentar Novamente
                </Link>
            </div>
        </div>
    );
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
