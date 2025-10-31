# 🎨 Paleta de Cores do AtendeXP

Bem-vindo à identidade visual do **AtendeXP**!  
Esta paleta foi cuidadosamente desenvolvida para transmitir modernidade, tecnologia e confiança — tudo isso com um toque vibrante e inovador.

Use as variáveis CSS abaixo para manter **consistência visual** em toda a sua aplicação.  
Confira os exemplos visuais e códigos prontos para copiar e colar!

---

## 🌈 Paleta Principal

### Cores Primárias

| Cor       | Hex      | Exemplo Visual                                                                 |
|-----------|----------|--------------------------------------------------------------------------------|
| Violeta   | `#7A3FBF`| <div style="background-color:#7A3FBF; width:60px; height:30px; border-radius:4px;"></div> |
| Magenta   | `#E040FF`| <div style="background-color:#E040FF; width:60px; height:30px; border-radius:4px;"></div> |

### Cores Secundárias

| Cor            | Hex      | Exemplo Visual                                                                 |
|----------------|----------|--------------------------------------------------------------------------------|
| Grafite Escuro | `#333333`| <div style="background-color:#333333; width:60px; height:30px; border-radius:4px;"></div> |
| Branco Puro    | `#FFFFFF`| <div style="background-color:#FFFFFF; border:1px solid #eee; width:60px; height:30px; border-radius:4px;"></div> |

### Cores de Fundo

| Cor          | Hex      | Exemplo Visual                                                                 |
|--------------|----------|--------------------------------------------------------------------------------|
| Fundo Claro  | `#F9F9F9`| <div style="background-color:#F9F9F9; border:1px solid #ddd; width:60px; height:30px; border-radius:4px;"></div> |

### Gradientes

| Nome               | Valor CSS                                      | Exemplo Visual                                                                 |
|--------------------|------------------------------------------------|--------------------------------------------------------------------------------|
| Gradiente Principal| `linear-gradient(45deg, #7A3FBF, #E040FF)`     | <div style="background:linear-gradient(45deg, #7A3FBF, #E040FF); width:120px; height:30px; border-radius:4px;"></div> |

---

## ⚙️ Variáveis CSS

Cole este bloco no seu `:root` para usar em toda a aplicação:

```css
:root {
  /* Cores primárias */
  --primary-violet: #7A3FBF;
  --primary-magenta: #E040FF;
  
  /* Cores secundárias */
  --dark-graphite: #333333;
  --white: #FFFFFF;
  
  /* Cores de fundo */
  --background-light: #F9F9F9;
  
  /* Gradientes */
  --gradient-primary: linear-gradient(45deg, #7A3FBF, #E040FF);
  
  /* Cores de estado (padrão Bootstrap) */
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
  --info: #17a2b8;
}

Você pode usar estas variáveis CSS para manter a consistência visual em toda a sua aplicação, aplicando-as em elementos como:

Botões principais: var(--gradient-primary) para background
Cabeçalhos: var(--primary-violet)
Textos: var(--dark-graphite)
Fundos: var(--background-light)
Elementos de destaque: var(--primary-magenta)
Esta paleta de cores reflete a identidade visual moderna e tecnológica do AtendeXP, mantendo a consistência com o logo e os elementos visuais que criamos.

Paleta de Cores Principal:
Cores Primárias:

Violeta: #7A3FBF (RGB 122-63-191)
Magenta: #E040FF (RGB 224-64-255)
Cores Secundárias:

Grafite Escuro: #333333 (RGB 51-51-51)
Branco Puro: #FFFFFF (RGB 255-255-255)
Cores de Fundo:

Fundo Claro: #F9F9F9 (RGB 249-249-249)
Gradientes:

Gradiente Principal: Linear-gradient(45deg, #7A3FBF, #E040FF)
