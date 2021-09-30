import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';

function ProfileSideBar(props) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${props.githubUser}.png`} style={{ borderRadius: '8px' }} />
      <hr />

      <a className="boxLink" href={`https://github.com/${props.githubUser}`} target="_blank">
        @{props.githubUser}
      </a>
      <hr />

      <AlurakutProfileSidebarMenuDefault />
    </Box>
  )
}

function ProfileRelationsBox(propriedades) {
  return (
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {propriedades.title} ({propriedades.items.length})
      </h2>

      <ul>
        {/* {seguidores.map((itemAtual) => {
          return (
            <li key={itemAtual}>
              <a href={`/users/${itemAtual}`}>
                <img src={`https://github.com/${itemAtual}.png`} />
                <span>{itemAtual}</span>
              </a>
            </li>
          )
        })} */}
      </ul>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  const usuarioGithub = props.githubUser;
  const [comunidades, setComunidades] = React.useState([]);
  const pessoasFavoritas = [
    'rafaballerini',
    'omariosouto',
    'peas',
    'juunegreiros',
    'marcobrunodev',
    'felipefialho'
  ]

  const [seguidores, setSeguidores] = React.useState([])

  // 0 - Pegar o array de dados do Github

  React.useEffect(function() {
    // GET
    fetch('https://api.github.com/users/peas/followers')
    .then(function (respostaDoServidor) {
      return respostaDoServidor.json();
    })
    .then(function (respostaCompleta) {
      setSeguidores(respostaCompleta)
    })

    // API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': '65c6639c483590972ac9ef9ebf8007',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ "query": `query {
        allCommunities {
          title
          id
          imageUrl
          creatorSlug
        }
      }` })
    })
    .then((response) => response.json()) // Pega o retorno do response.json() e já retorna
    .then((respostaCompleta) => {
      const comunidadesVindasDoDato = respostaCompleta.data.allCommunities
      console.log(comunidadesVindasDoDato)
      setComunidades(comunidadesVindasDoDato)
    })

  }, [])

  // 1 - Criar um box que vai ter um map, baseado nos itens do array que pegamos do GIthub

  return (
    <>
      <AlurakutMenu />
      <MainGrid>

        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <ProfileSideBar githubUser={usuarioGithub} />
        </div>
        
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="Title">
              Bem vindo(a)
            </h1>

            <OrkutNostalgicIconSet />
          </Box>

          <Box>

            <h2 className="subTitle">O que você deseja fazer?</h2>

            <form onSubmit={function handleCriaComunidade(e) {
              e.preventDefault();
              const dadosDoForm = new FormData(e.target);

              console.log('Campo? ', dadosDoForm.get('title'));
              console.log('Campo? ', dadosDoForm.get('image'));

              const comunidade = {
                title: dadosDoForm.get('title'),
                imageUrl: dadosDoForm.get('image'),
                creatorSlug: usuarioGithub,
              }

              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(comunidade)
              })
              .then(async (response) => {
                const dados = await response.json();
                console.log(dados.registroCriado);
                const comunidade = dados.registroCriado;
                const comunidadesAtualizadas = [...comunidades, comunidade];
                setComunidades(comunidadesAtualizadas)
              })
              

            }}>

              <div>
                <input 
                  placeholder="Qual vai ser o nome da sua comunidade?" 
                  name="title" 
                  aria-label="Qual vai ser o nome da sua comunidade?" 
                  type="text"
                />
              </div>

              <div>
                <input 
                  placeholder="Coloque uma URL pra usar de capa." 
                  name="image" 
                  aria-label="Coloque uma URL pra usar de capa." 
                />
              </div>

              <button>
                Criar Comunidade
              </button>

            </form>

          </Box>

        </div>
        
        <div className="profileRelationArea" style={{ gridArea: 'profileRelationArea' }}>

          <ProfileRelationsBox title="Seguidores" items={seguidores} />

          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Comunidades ({comunidades.length})
            </h2>

            <ul>
              {comunidades.map((itemAtual) => {
                return (
                  <li key={itemAtual.id}>
                    <a href={`/communities/${itemAtual.id}`}>
                      <img src={itemAtual.imageUrl} />
                      <span>{itemAtual.title}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>

          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Pessoas da Comunidade ({pessoasFavoritas.length})
            </h2>

            <ul>
              {pessoasFavoritas.map((itemAtual) => {
                return (
                  <li key={itemAtual}>
                    <a href={`/users/${itemAtual}`}>
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          
        </div>
      
      </MainGrid>
    </>
  )
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context)
  const token = cookies.USER_TOKEN;
  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
  .then((resposta) => resposta.json())

  if(!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  const {githubUser} = jwt.decode(token)
  return {
    props: {
      githubUser
    }, // will be passed to the page component as props
  }
}
