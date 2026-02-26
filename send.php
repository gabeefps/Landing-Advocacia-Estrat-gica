<?php
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
  http_response_code(400);
  echo json_encode(["ok"=>false, "error"=>"JSON inválido"]);
  exit;
}

$to = "contato@advocacia.com";
$subject = "Novo contato do site - " . ($data["assunto"] ?? "Sem assunto");

$nome = $data["nome"] ?? "";
$telefone = $data["telefone"] ?? "";
$tipo = $data["tipo"] ?? "";
$assunto = $data["assunto"] ?? "";
$mensagem = $data["mensagem"] ?? "";

$body =
"Novo lead recebido:\n\n" .
"Nome: $nome\n" .
"WhatsApp: $telefone\n" .
"Tipo: $tipo\n" .
"Assunto: $assunto\n\n" .
"Resumo:\n$mensagem\n";

$headers = "From: Site Advocacia <no-reply@seudominio.com>\r\n" .
           "Reply-To: $to\r\n";

$sent = mail($to, $subject, $body, $headers);

echo json_encode(["ok"=>$sent]);