# 🔧 Sistema de Administração - BrasilSim

## 📋 **Visão Geral**

O Sistema de Administração do BrasilSim foi desenvolvido para facilitar os testes, gerenciamento e manutenção do jogo. Ele oferece uma interface completa para administradores controlarem todos os aspectos do sistema.

## 🌐 **URL Permanente**

**URL Principal**: https://y0h0i3cy6y5o.manus.space

**Modo Admin**: https://y0h0i3cy6y5o.manus.space/?admin=true

## 🚀 **Como Acessar**

1. **Acesso Normal**: Visite a URL principal para jogar normalmente
2. **Modo Admin**: Adicione `?admin=true` na URL ou clique no link "Admin" (canto inferior direito)
3. **Interface**: O modo admin carrega automaticamente o painel de administração

## 🛠 **Funcionalidades Implementadas**

### **📊 Dashboard de Estatísticas**
- Total de estados criados
- Total de decisões disponíveis
- Estados por região (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)
- Estados por tipo de governo (Democracia, Tecnocracia, Coronelismo)
- Indicadores médios de todos os estados

### **🏛️ Gerenciamento de Estados**
- **Listar Estados**: Visualizar todos os estados com informações detalhadas
- **Deletar Estados**: Remover estados específicos para testes
- **Editar Indicadores**: Modificar manualmente os valores dos indicadores
- **Reset Cooldown**: Permitir que estados tomem decisões imediatamente
- **Informações Extras**: Data de criação, última decisão, contagem de decisões

### **⚖️ Gerenciamento de Decisões**
- **Listar Decisões**: Ver todas as decisões políticas disponíveis
- **Criar Decisões**: Adicionar novas decisões personalizadas
- **Deletar Decisões**: Remover decisões específicas
- **Validação**: Sistema completo de validação de dados

### **🗑️ Limpeza de Dados**
- **Clear All Data**: Função para limpar completamente o banco de dados
- **Confirmação**: Sistema de segurança para evitar exclusões acidentais

## 🔌 **APIs de Administração**

### **Estatísticas**
```
GET /api/admin/stats
```
Retorna estatísticas gerais do sistema.

### **Estados**
```
GET /api/admin/states                    # Listar todos os estados
DELETE /api/admin/states/{id}            # Deletar estado específico
PATCH /api/admin/states/{id}/indicators  # Atualizar indicadores
PATCH /api/admin/states/{id}/reset-cooldown # Resetar cooldown
```

### **Decisões**
```
GET /api/admin/decisions        # Listar decisões
POST /api/admin/decisions       # Criar nova decisão
DELETE /api/admin/decisions/{id} # Deletar decisão
```

### **Limpeza**
```
DELETE /api/admin/clear-all-data # Limpar todos os dados
```

## 📝 **Exemplos de Uso**

### **Criar Nova Decisão**
```json
POST /api/admin/decisions
{
  "title": "Investimento em Energia Renovável",
  "description": "O governo está considerando um grande investimento em energia solar e eólica.",
  "options": [
    {
      "text": "Investir pesadamente em energia renovável",
      "effects": {
        "economia": -5,
        "saude": 3,
        "cultura": 2,
        "satisfacao": 4
      }
    },
    {
      "text": "Manter matriz energética atual",
      "effects": {
        "economia": 2,
        "corrupcao": 1
      }
    }
  ]
}
```

### **Atualizar Indicadores**
```json
PATCH /api/admin/states/{id}/indicators
{
  "indicators": {
    "economia": 75,
    "educacao": 60,
    "saude": 80
  }
}
```

## 🎯 **Casos de Uso para Testes**

### **Teste de Criação de Estados**
1. Acesse o modo admin
2. Verifique estatísticas iniciais
3. Crie alguns estados via interface normal
4. Volte ao admin para verificar se foram registrados

### **Teste de Decisões**
1. Crie um estado
2. Use "Reset Cooldown" para permitir decisões imediatas
3. Tome algumas decisões
4. Verifique se os indicadores foram atualizados

### **Teste de Rankings**
1. Crie múltiplos estados
2. Modifique indicadores manualmente via admin
3. Verifique se os rankings refletem as mudanças

### **Limpeza para Novos Testes**
1. Use "Clear All Data" para resetar o sistema
2. Confirme que todas as estatísticas voltaram a zero
3. Recrie dados de teste conforme necessário

## 🔒 **Segurança e Considerações**

### **Acesso**
- O modo admin é acessível via parâmetro URL
- Não há autenticação implementada (adequado para ambiente de desenvolvimento)
- Para produção, seria necessário implementar autenticação

### **Validações**
- Todos os endpoints validam dados de entrada
- IDs são validados como UUIDs válidos
- Indicadores são limitados ao range 0-100
- Estruturas de decisões são validadas completamente

### **Backup**
- Antes de usar "Clear All Data", considere fazer backup dos dados
- As operações de exclusão são irreversíveis

## 🚀 **Próximos Passos**

### **Melhorias Futuras**
1. **Interface Visual**: Criar interface gráfica para o admin
2. **Autenticação**: Implementar login para administradores
3. **Logs**: Sistema de auditoria de ações administrativas
4. **Backup/Restore**: Funcionalidades de backup e restauração
5. **Métricas Avançadas**: Gráficos e relatórios detalhados

### **Expansões Possíveis**
1. **Simulação em Massa**: Criar múltiplos estados automaticamente
2. **Cenários de Teste**: Templates de situações específicas
3. **Monitoramento**: Dashboard em tempo real
4. **Exportação**: Exportar dados para análise externa

## 📞 **Suporte**

Para dúvidas ou problemas com o sistema de administração:

1. Verifique os logs do console do navegador
2. Teste as APIs diretamente via curl
3. Consulte esta documentação
4. Verifique se a URL está correta

---

**Sistema desenvolvido para facilitar testes e administração do BrasilSim** 🇧🇷

