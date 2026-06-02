const bcrypt = require('bcryptjs');

async function main() {
    // Gerar hash para senha 123456
    const hash = await bcrypt.hash('123456', 10);
    
    console.log('\n========================================');
    console.log('HASH GERADO COM SUCESSO!');
    console.log('========================================');
    console.log('Senha: 123456');
    console.log('Hash: ' + hash);
    console.log('\nCopie o comando abaixo e execute no MySQL Workbench:');
    console.log('========================================');
    console.log('USE hospital_chamados;');
    console.log('UPDATE usuarios SET senha = \'' + hash + '\';');
    console.log('SELECT id, nome, email, LEFT(senha, 30) as hash_inicio FROM usuarios;');
    console.log('========================================\n');
}

main();