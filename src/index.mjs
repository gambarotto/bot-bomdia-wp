import jimp from 'jimp';
import path from 'path';
import moment from 'moment';
import wa from '@open-wa/wa-automate';

moment.locale('pt-br');

function pegarLinkDeImagemAleatorio(){
  return `https://picsum.photos/400/400?random=${Math.random()}`
}

async function pegarDimensoesDaImagem(imagem){
  const largura = await imagem.getWidth();
  const altura = await imagem.getHeight();
  return {largura, altura};
}
async function pegarDimensoesDoTexto({font, texto}){
  const largura = await jimp.measureText(font, texto);
  const altura = await jimp.measureTextHeight(font, texto, largura)
  return {largura, altura};
}
function pegarPosicaoCentralDaImagem({dimensaoImagem, dimensaoTexto}){
  return dimensaoImagem / 2 - dimensaoTexto / 2;
}

(async function(){
  const link = pegarLinkDeImagemAleatorio();
  const imagem = await jimp.read(link);
  const dimensoesDaImagem = await pegarDimensoesDaImagem(imagem);
  const font78 = await jimp.loadFont(path.resolve('src', 'fonts', 'font78.fnt'));
  const dimensaoFont78 = await pegarDimensoesDoTexto({font:font78, texto:'BOM DIA'})
  const font28 = await jimp.loadFont(path.resolve('src', 'fonts', 'font28.fnt'));
  const dimensaoFont28 = await pegarDimensoesDoTexto({ font: font28, texto: 'QUE VOCÊ TENHA UMA ÓTIMA ' })

  let imagemComTexto = await imagem.print(
    font78,
    pegarPosicaoCentralDaImagem({
      dimensaoImagem: dimensoesDaImagem.largura,
      dimensaoTexto: dimensaoFont78.largura,
    }),
    0,
    "BOM DIA"
    );
  imagemComTexto = await imagemComTexto.print(
    font28,
    pegarPosicaoCentralDaImagem({
      dimensaoImagem: dimensoesDaImagem.largura,
      dimensaoTexto: dimensaoFont28.largura,
    }),
    dimensoesDaImagem.altura - dimensaoFont28.altura - 30,
    "Que você tenha uma ótima "
  );
  imagemComTexto = await imagemComTexto.print(
    font28,
    pegarPosicaoCentralDaImagem({
      dimensaoImagem: dimensoesDaImagem.largura,
      dimensaoTexto: dimensaoFont28.largura,
    }),
    dimensoesDaImagem.altura - dimensaoFont28.altura,
    moment().format('dddd').toUpperCase()
  );
  const imagemBase64 = await imagem.getBase64Async(jimp.MIME_JPEG);
  //console.log(imagemBase64);

    const cliente = await wa.create();
    const grupos = await cliente.getAllGroups();
    const gruposFamilia = grupos.filter(grupo => grupo.formattedTitle.includes('Família') )

    for(let i = 0; i < gruposFamilia.length ; i++){
      console.log(gruposFamilia[i].formattedTitle);
      
      await cliente.sendFile(gruposFamilia[i].id, imagemBase64, 'bomdia.jpeg', 'Enviado pelo robô feito pelo Diego');
    }
})()