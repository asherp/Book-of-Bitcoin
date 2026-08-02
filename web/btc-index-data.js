// SPDX-License-Identifier: CC-BY-4.0
//
// btc-index-data.js — the curated ledgers of the Bitcoin Book: which addresses
// the book keeps a ledger for, what to call them, and the story that earned
// each one its place.
//
// This file is the editorial layer — a reading of the record, not the record
// itself — and is licensed CC BY 4.0, separately from the machinery that
// discovers and renders these ledgers (btc-index.js, MIT OR Apache-2.0) and
// from the book's prose (CC0, the chain's own speech). See the README's
// License section. The chain says an address received coins; that the address
// is worth a reader's attention, and what to call it, is somebody's judgment —
// and judgment carries a name.
//
// The table of contents and the index are inverses. The contents is a curated
// list of *places* -- each entry names one block or transaction and cites it
// once. The index is a curated list of *names* -- each entry is an address,
// and its citations are discovered from the chain at read time: every
// transaction that touches the address becomes a chapter citation, the way a
// name in a book's index trails the run of pages it appears on. So where a
// contents entry's id resolves to one citation, an index entry's address
// resolves to many -- an open-ended list that grows as the address is used.
//
// Two criteria decide what is kept. The address has to matter -- historically,
// or because reading it teaches something about how the chain reads anyone.
// And it has to be public already: published by its owner, or entered into a
// public record, before this book set it down. Donation addresses are the
// plainest case of both and the shelf opens with them; the same standard
// admits proof-of-reserves addresses, coins seized by state actors, exchange
// breaches, and addresses entered into court filings.
//
// The public-already criterion is what keeps the shelf honest: a ledger here
// adds legibility, never exposure. Ordered by the address's famous moment
// (reading order), like the contents -- not alphabetically; the list is short
// enough to scan whole.
//
// A ledger is a titled set of addresses -- most hold one, but a campaign
// that rotated wallets, or a reader gathering their own, may hold several.
// Each address keeps its own map (one line in the store); the ledger is the
// grouping above them, and its page turns between them like leaves.

export const INDEXED = [
  // The shelf's longest anthology. Its story is now a published reading rather
  // than a source comment: notables.yaml keeps the address as a curated entry,
  // and commentary/wikileaks-ledger.md is what the Ledger opens over it.
  { title: 'WikiLeaks', addresses: ['1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v'] },
  // The Free Ross campaign's vanity donation address (the name is mined into
  // the base58), collecting for Ross Ulbricht's defense and advocacy from the
  // Silk Road trial era (2014) through freeross.org, until the January 2025
  // pardon turned the cause from clemency to gratitude -- donations kept
  // arriving after it.
  { title: 'Free Ross — Ross Ulbricht defense fund', addresses: ['1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'] },
  // The Hal Finney Bitcoin Fund for ALS research, opened as Hal died (August
  // 2014, the ice-bucket summer) after five years with the disease. The first
  // transaction's recipient, remembered in donations toward its cure; the
  // Bitcoin Foundation gave first. The annual Running Bitcoin Challenge
  // (January 1-10, closing on the "Running bitcoin" tweet's anniversary)
  // donates through processor pages with no fixed address, so this fund is
  // the tribute's citable line.
  { title: 'Hal Finney Bitcoin Fund — ALS research', addresses: ['1JsnZLEGgLJY7rbDdaKTzC2JyvfaKUpF5p'] },
  // The EFF's standing bitcoin address, published on its "Other Ways to
  // Give" page. The foundation's bitcoin story runs the currency's whole
  // arc of respectability: an early 2011 acceptance, withdrawn the same
  // year over legal uncertainty, resumed for good in May 2013 -- and now a
  // plain address on the donations page, listed among the checks and wire
  // transfers.
  { title: 'Electronic Frontier Foundation', addresses: ['3LTu6uavQ4A3kgDauZipyGqcHQEUSVe2so'] },
  // The Tor Project's donation wallet, from the standing addresses page it
  // has kept since 2019 (donate.torproject.org/cryptocurrency). The same
  // address answers on tails.net/donate: Tails joined the Tor Project in
  // 2024, and the anonymity network and its amnesic operating system share
  // the one wallet.
  { title: 'Tor Project', addresses: ['bc1qtt04zfgjxg7lpqhk9vk8hnmnwf88ucwww5arsd'] },
  // The donation address Keonne Rodriguez, Samourai Wallet's co-founder,
  // published from federal prison (2026), appealing to the Bitcoin community
  // for help with the legal debt of the Samourai prosecution: arrested April
  // 2024 over the privacy wallet, a 2025 guilty plea to operating an
  // unlicensed money-transmitting business. An open appeal, so its index
  // line is still being written.
  { title: 'Free Samourai — Keonne Rodriguez', addresses: ['bc1qtjjcvn98wh7dfd55m8kxhjcfexanttwt8gtan8'] },
  // The Coldcard theft of July 2026: the attacker's vaults, where the stolen
  // coins sit. A March 2021 firmware error left Mk3 seed generation on a
  // deterministic software PRNG — roughly 40 bits of entropy where 128 were
  // promised — and someone regenerated the seeds offline and swept what they
  // unlocked: three waves, July 30 to August 1 (blocks 960,183-960,471),
  // ~1,360 BTC from 4,312 verified victim addresses. Direction is the
  // attribution: each theft is one input, one output, no change, and the
  // sweeps converge — hundreds of strangers paying into one destination at
  // one hardcoded fee rate, which no rescue produces. The victims' own
  // addresses are not shelved: the reconstruction that published them asks
  // that its list never become a screening feed, and this shelf adds
  // legibility, never exposure. The thief's side carries no such weight.
  // Sources: Galaxy Research's wave accounting and Chainalysis's tracing
  // (the first vault below was published by both within hours of the
  // sweep), reconciled against the Coldcard Sweep Watch reconstruction
  // (coldcard-watch.vercel.app); every address checksum-verified before
  // shelving, per the standard below.
  { title: 'Coldcard hack',
    addresses: [
      // Waves 1 and 2 (July 30-31): sweeps converged on shared collectors,
      // then settled into these seven vaults. BTC figures are the traced
      // attribution at the time of shelving, not a live balance.
      'bc1qq85v2c926eg6pgxhwp6q7lf6cnsz80qs3fcu9r',                     // 562.01962301 BTC
      'bc1qx76cae2706qd5q576feh7xq8rfcsjpf2htfhe3',                     // 398.47573857 BTC
      'bc1q8jy96fe5lf8vfugydnte3cguk92gpev7kwtp3q',                     // 89.62327890 BTC
      'bc1qtfrwa4j6rmj9rsgspv6a0yjumkg39js2numu75',                     // 45.90251994 BTC
      'bc1qnk4zh9qcnap2mycp56qjrgza3cc8ylrh8fecp0',                     // 32.45056320 BTC
      'bc1qmd5m5ktv7m5ffujxv4248fxv36myvdx79n8jp6',                     // 30.18476329 BTC
      'bc1qhh4jkkj07vxpdt0zlvxctjlfhqmurhxa24x3h2',                     // 0.19153809 BTC
      // Wave 3 (July 31-Aug 1): no shared collector — every drained wallet
      // got its own fresh P2WSH vault, 214 in all, listed largest first.
      'bc1qn3uy9j26m79vghed2uddr89l344xa5efnn4d0rxhz4q3xxlyxryqq595ld', 'bc1qu5dgcwgm0c6qazqhacskakt8qrqj96wfkyfzjsf2lje9unzjznasfmaygs',
      'bc1qt7ktwfru52emkyyuw6nkju6lck98uxtc5r6gfwethgas50ufn22qpfsewn', 'bc1qh0kkrnegczjr39rw52fvutv4ur6kvtdnva3jf6tkwwy7hwwtl4uqm96ruj',
      'bc1qajca7effwcxgpdf4aagh3h3fz634fnk93ar7c00hvghs3lrgk4tqd23qsa', 'bc1qysjc4jrltc4je2f9uek477xdczkrmkd0mwv2wgn47r0wt3qv4a7spkkx7h',
      'bc1qtsp50w4uru6t2mhmctvapfdy23g75r08werm7qmgzuedm4jsaztspf73yt', 'bc1qmqc0vur7v0xcnvq2pzm2kxlmvw6twhlxtsvd8jgudjdwnud6juusx4nlwt',
      'bc1qsev2de8syz3g9005q7ckkthak6jhz2y4gzjc8a7tfatdkx7y42sqdtwlwd', 'bc1qunepx2e5f65xa9cftcv6t6qcnwky77g9sl8k95zcty4jqwkxuurqs9ap78',
      'bc1qcryst78hk4z75hsu5dyutlgnyw3g3grcwsenfvhpl3uvpf0m6paqqr0epc', 'bc1qfdps7y2239kh8vpm7c08ysgsx25a4e90ashpnyzsl9kq493ge4dqcgzcc4',
      'bc1qvyzwwpf38jntuusr8x6nefqmafkdqe8h0m5k8zkh5nnte29h8sxqes4sp2', 'bc1qg4qf5dqsry4wrhdp3wcf9eml6m0gy53c6nfxkg3wnyj7j36nefds7kkxcf',
      'bc1qrw2njsqq5hv77wx7dnrff6la86tefqndv5rnwkmzh2g8qplp7vjq7acn5e', 'bc1qhm7vwpzaj9ahhhcmcxmsgqlj6tct84qupwdqe77djznvqrc9ksxqsxflvy',
      'bc1qunseds6wr6q6qux972jfrl7fckfehcp0ldanhryvmvtw93w0ekzq0rwsnx', 'bc1qyqjwt8gc5jcveknknvdjzjvk5u5zcy0hkaznwxt69x5kyxueqztsm5a848',
      'bc1qhx7w9u2ahwmq2gtkepgtl9urlkfjn6zqdqr5sjzjvs7z8z8r4ytqgwadeu', 'bc1qe68n9fruk29e9kgps0rf55mjpts0u2sgzq7nxamd0hppnpky8fas7226a5',
      'bc1qy76lxfn55t7xk5xurvyt6u564fug9g8j3q5mf8j4cddesdn27l5sasslyf', 'bc1q7qu3wyh6vz40j03x4s7vyeh29t08tfc3gm9mckuqq27yg7zlmsrq0qacp4',
      'bc1qe7lwuc3vjzmf3rgvh9sc7y8sxmej7vr8pcsyae7me7vr7hu8qfeqvxafaj', 'bc1qw3mqlq88es7046e366hmledrydd5aqz5kpw57hq3fxutmctl7m3swxyhph',
      'bc1q48yxfmeckk5r0nkzkjw83xyhtvhl7jhfmkzdpxuqy3yg7nd4k4qsu4r4zn', 'bc1qvlaxcmgnqyej6g0j79fzgga6s4za54yqyxzdfgv2cvazzn83kp6s9kqr94',
      'bc1qmfyggrvay30lfrn0743f0g4v20agl2gvkmcaycxd5tf6nh5nxfgqlq084x', 'bc1qr4jfp7f5cmrtrl2gxsrujyec60gq3x54p4u08n8xgslkvww787nq4ylgjt',
      'bc1q4x7ydyupwz26ytwwykrnh0dd8my343cmlzwfhfcdy9c80qsdztzqurffxu', 'bc1qkz22xld4ayh0gcvsdc43v9yuylzczhhasqsts8swq3clck0mrgzqulkacd',
      'bc1qmhhm9s0mwq53jskqfywgpza6pqqugzax4twpdnsdd0jxv56dh8rqm58kkh', 'bc1qkaqcswmepnauaxnczf5waxuer3zqce2tsjcl99dnyeywfpcxmq0q9j8lch',
      'bc1qxkpyzkx5pewn8gjqwvw979hpc3ufsqugm5c540xeeq4ue0s6yuestkfqla', 'bc1qj3jd8yakc2h3kta302h0nfn959aeqdyd987atyaquk0z6ulje2rqj5v27w',
      'bc1qxuva8whfr2x49puaq09lv20ucla7ar5zfpx4a7ujmw69hawvd0esuddrs5', 'bc1q2q8epfccrc9aynv7uz7z7j93rnz5gwuz8le6zhd0t386d3etcpxs6h0lm2',
      'bc1qtwx5m06dmxt5as7ulpkuq5kd345q3teauwu833mkf5s7jft4nl9qjfyxru', 'bc1qfgv6pyhs6y2cs0rzc5cuadsdzjju6ae0t7qwvdle3zy5vmf02ynqs4h9ae',
      'bc1qwy642mr3u4gwl3zwzxd6p7l3m33a0mhp6xdj27y83dqsrw7xxvcq65xj4s', 'bc1qtu8suvhp2zp994fnawvrmuvh5k263waap3kmwluzacfsdv4x9grs4eg09u',
      'bc1qcu3w05j0n7s3q7nlwn0apsfnyapxd7r3xj2rrny0ffnkfxmpuafqetphx4', 'bc1q3ehq9tz6zz9xur969exg2rnpsqge6uf9vqanz3v856knnz5w2e9sa5yh8j',
      'bc1qqu0sp6d4wxnp33ghgrtexrczzzl85f3vnlueep2hlsw69t38xazqltw5ac', 'bc1qsjltn7mjlkl3fuxdexdnjjyzp9fxcvzxn92upxa0764nfxl7a6eqzc0szd',
      'bc1qtl628t8mfce0sgfxpkt5csu2uw4jema7ekz5gj2atsvktyzwur2qwh9r2j', 'bc1qa3mfkwwdsa2xa6xsazp5yd2cr5e3tyf7j0mgax7xzumpj4gtz77sdzd64z',
      'bc1q5c6m8qrqum6xhlyaw9yplggak4vlz6p9kj8szcphh2x0jvfa3heq5mgfa2', 'bc1qt2k74x6s8wdtvqwmdnhdzm4k7dvueprh3e0hvs9q68w0eq6xm49s3kf758',
      'bc1q7fgsarhqap7kzhpy2efj5d5fha735jne2e225g9dzn244f3je84smsv9fj', 'bc1qrx4r4dgfhtfn3ekumz6f53m7s9y5wch985fa0zxznz6hnm6vt9sqkutf0n',
      'bc1q464uswwg3sq3c00wc8wqhlhqpl0samckyggnzhlk3rjl38nhr6ssslhtk0', 'bc1qkl4vkxz7ax3zkwz6awq4pv2xuznjzqrs4ve4h957zrvpy8jfyvsshglgc2',
      'bc1q893u2894gx3ctxdl4hfn78ya60zzqndfpsucm02q7d0wf7l6rdvq2p64rx', 'bc1q75t6kucn702r8fmg5wt7xq3pgvw0lkua2p5a6wv2f2nlrmhlu44que6rl2',
      'bc1qc5j2jgp0mgrxsmq79gq5yv0gavyuxfd3z3plss4mcrvnq0239zeq822mln', 'bc1qnjpfhc4pdmxmp2tzjz45u22anttwtk4u0lty5x2k7qwcsjm0hn2sa8tqc5',
      'bc1q64nmnz88qe0ee0e3a3ne4mnelvajz8dq5zcf8mqvslqcx72hdtzqsu2td0', 'bc1qassuukkcmngzuvg3crswanmsnr08pjnunvc24f7r2p0zjnj35sushh93zs',
      'bc1qxhju5xspcy8vu9ey4fve548wycm6nhq3vrvp902e0xsm0cz7l8zqh2snjc', 'bc1qq2y3q0c4ulhe9c00pmxmhxkdcsuc0pf93krhcmqk3cy7nkjkc6vqgjpzkl',
      'bc1q6vc45ulxcyra499strhwrrppcnqk6s40wrn4frl4dpx5wansl0cs9yklv7', 'bc1qrmp5a6xdve2k9kun5g22y09gdwnmd3e6npxt0s2t7nzxrnv9uufs7z8w8m',
      'bc1qu673mdghv3e8sctx7vmjv5uzrgz9khzw4q7nefuu3uhmsehst5sqhz5ztq', 'bc1qhvrd93pj6zh5qt23g79v3c06j7weuyljsjkc8klr7sqgkncgpkksptvlfn',
      'bc1q0pyh8m970h2gsv8l8l58alk02qt6q9hnzf6mh4r3rurqkhvdllns3m6nkf', 'bc1q5k77u9n2c5tp7mg3pwauyhcju0c2sytfem84rpqwj5par392qwvslddty4',
      'bc1qmkqkq6c7nj9ahrldajdktwgnkw98yxcn6rvq0p4ude8a3lrc4p2ql4mgyu', 'bc1qwymjp76jw6m2qyctynwfpy37cdwcdryhamclg2vdvucgheql09as3u33zw',
      'bc1qm2de6c09vajzztvxzv8tzn2a7rj68sx4zjcaczunh6s34yh0fyvqmnq34p', 'bc1q6vpkjwgv88w53v03axsd6k0jjr8zjv9mrt5swgda9k45qh75764s37udc6',
      'bc1qtujm6ufvvnmemtjyulmhgq9cky7ww92yc2t0ye8t2kyd6eu563vqwpqs6r', 'bc1qfeg6uqsv7rt59yp3fs44x8wunre5vpgum7shkejwxz86hvn3c9uqa58my8',
      'bc1qkwhtguuqpdlr2zjq7nf87etgs9f3y98qy6epvgk6kl7xe02msntst8n5zl', 'bc1qkyncy6suewl4gs7ptvwggvvdwtt70u68rey7yw2ymyuxcpwxagmssw293h',
      'bc1qpthn8eycdm9e8jkp8k2sv24ns3vj7ts4m8cc2jy3728n20av4ctsqkg3ud', 'bc1qnfva34p08dukgspjlc64tzj4ge9dyh6xsz7qfgvfueur6ylz09dqxukm5w',
      'bc1qaktzwvyx49jfa576ftypjyuf4ncu4hhy5k4cpnuswjfpqhsx45nsyg8zmd', 'bc1q0p97htge7cg6uw8t0gnkexsx32yyzwx68yvkpn59k7jmzwd233xqhy2r2h',
      'bc1qpncfuuc8349wpleqt3spk3j2u07he3t2w26w5zsf0ypp0hezkk0sfxdzff', 'bc1qd4mgu2memc9a6qf99ht3sgtprc53m323dwuj94nauqykj00qdk7st3w43g',
      'bc1q5095kyf7dlskq9fc9lujskvfjv23ngmaryndm0gkcea782u5a52qzuz3fr', 'bc1qpq3rxvpwk5qg5usa0lqkuhderjua9pyuaqa2jtt446njryvm3x3sc49vq7',
      'bc1qepuh86pnseh6cvgjjtwzvn938f0fexksamy2jac88qc80prvazqqzpd5sf', 'bc1qzkkhctjrx7wlh7gdnvpmghny4el3eldv6wxw0upwkkek9nn54fasr7py7l',
      'bc1qdh03rzggxmudycyhayxe8gasdzs52u9jj0khx0pxt6ldc5k8ecmqw0plyz', 'bc1qyj735ealstq0zpmxttfur2kl2rppaqlddwcy8snu3pka4zrdur2qqejxzx',
      'bc1q8p3086ds26v8ev56u4mkwaamgz427w8nwq8fk95n5naa6rk0y8ws5k8jxd', 'bc1q5vg8ct0nmejgd3pm96s69dfh7fzv53tfyaa5ffwkxa6s5xzw7m9s90mpt2',
      'bc1qhtjcwj0r5p8739tkc3cwudh24kyt6kzsxg84yn4s7frcs89rvzps5pnm2q', 'bc1qsm6ag0zzvltpav0esyu5t3z6tpmfpyjt7lg4v8zuaf87hvml267q7v5mk7',
      'bc1qntaar83shrgxv90k9lqmdumtyvqahgh6l4jzwtt0g2d6040x2gdsqlksy7', 'bc1qnjdng07rj0cp732xm2vrxjqq8nqlp637j30wa7jxcfn8xjn6a6jsxce4t6',
      'bc1q5xed2ha67mgg4uhnjgk4jarmyf5ppwafd7mr8yrj5kuy8su5crfqzqqdmm', 'bc1qwhj5zdrg0ak3a92nwfvfxdpjflelx5d56d4z906qmks24dm6mr9qwmj8k4',
      'bc1qnxs73ptxpkm20d0pdgmc4pcnfpmjwnrspv6ry3td6a7utrlr5nyqr2r84m', 'bc1q68ryrhjlsfjmqcvtfplklpganlzuk8kfy9m39qrr5qa2tv3fl7xqd7mjd9',
      'bc1qk6tu7agyxq4cq5ve6qxfhard3wmp830rnyw8mxzvrxvgxxgg8yjq7m0xpd', 'bc1q7syv0ereyw07klc896h9msvnwgge4kp2wmaxw72z9mx2l46tlglsm5335p',
      'bc1q4v2hf3l6aq72r963jxu026d850cspjxczxxuwcsva3amtt996jxq20megd', 'bc1qjka87ah7erupvdtlrh2cy9nxruj4xamqrq7uf077v4ekqx0llmnsqxa8z3',
      'bc1qnx8620j80zefqagtnrrx9508rq7h6rweplgye3uarfg5j7smxvys8s5rae', 'bc1qad63pmt6h5vmshuexet43wlkl00ws0ks9607myjvc6rg2rxq9alqyutt2t',
      'bc1q4k3tuzqsg0eu3davgddet40vrqc6j8mfzfa9ne85pjj4kkrgkktskqjw3z', 'bc1qcyp4cjdper2jk6u04fw6uptnqjz72maajprwszjnc2cgesf2km4szr3zl6',
      'bc1q520jl5086c385ytdrn770wx7fg25c6nkkh3dalnn48vnq83p4g9qm7gynq', 'bc1q9m306lr4305h2wy43yxlur25n540z8gh26sldzqkzwtzycwk7czqely8mh',
      'bc1qg0ahk0z0h5u5umsf2pguc30z236wga3m46t4efw6ua23ngszw4xqmtufs2', 'bc1qn0alkyeues4q5fhk8hz3qycfrg9kdm6f6dtxn4z5645f2fjnpp6q6tht62',
      'bc1qxg6q4yhc734kzfjc9vauyqkavl5xjxxhegsfsk9q3tj6vrl8l9pqe8dela', 'bc1qr06wx2aevh0qqd0sfaj9mj2j5wrlz35r8j5aqf793rztnqh5pqxsld3z7d',
      'bc1qtvlcmah6ukr8jlg0q57efn9vz922egydnj0met8cs2dkp9w9s3ds93gd9x', 'bc1qs3hmed0nyvm8xlgn02557tgry8sy33jn84namf56l0qwssa7f3dskrxhd8',
      'bc1qj8a03jys70spzsxqtfv8gly3m7f8ffd7k4pgn8d5s5hcsd3stvqsrld23p', 'bc1q5cem3fs9xw7alskugu0ejpd9zc9tamxx7g7hkehdh3y77lq82x5q6ljx35',
      'bc1qum0q577qujwzdaa0q6ef0r94rmfxsfcn7tmve5s68dxw04l6dqcqnsdz95', 'bc1qlek7vwx4tyc9cm98ltcspfky0w43y70ncpda5aas6w9netqapg4qms6z7m',
      'bc1q4re4r9jvv6zxydq7wvgzpdtlnn5g2s5pmmxu6tl4ragcvh7w7aqsr0a4ny', 'bc1q0m7cptdnr0rl7tdz0xntz3wrcjhu33fmztazxtrajste68jrvt7sh9kly6',
      'bc1qygry8hzhqfjdx2wu4t2lch3ndsnyfrt0whpmhvvej622ucplpvzqxgr35z', 'bc1qdqhy59rmfuywq5cul2u5ncj2fegl5qs8pgq28fyqetyzq3u0u6pq9dxlwu',
      'bc1qty4ev9s4pcajfu6s42a8p2hp2pqt7uxhk8mh8046a9aledk0wtgqpkm3dg', 'bc1q4e4j2sev76vp805ft5qyfm9j38s83c5n6wpe7u3gztc4rt4nmvrshm7z6l',
      'bc1qtxanjh93h26pv5ut2g8clu5ucav0d3n8tpu2n55w9e5es6x5a4asye9h75', 'bc1q2my4dal726w3x4fgpt3ce6hc5dp5e7w9rjs96zkx6ngptdmajs0q9dwjhf',
      'bc1qxueed4eqvhu77qjfg32nxu5w0gejsrsljyq399k89ck82x4wlxrsy4m72x', 'bc1q2k0lx9y0rsmwsrhqm0pca783n287rprdfgq7qsncyxvft5pct7mqnngx96',
      'bc1ql4h3x0jqkh0cjdeug7lnrfmfygz83ys3e2n84lv6dadxuxfv3kcq2talu9', 'bc1qm099l8lr88anv2k85rlhvfhfue5xkrswwa3t0r330pkmm28754eqd32mhe',
      'bc1qkzphtyj2vyk0ytxf2f8jgjrhqepwxhy952vkg7vn0nunpxpg0yesd23t87', 'bc1q47gull3gwaygn69v3sserwvdfmxam25ly5gs4cylpr6206ppy3tskp3vsx',
      'bc1q5sx3fzxvpvq03nndqgp6k37r42jg8248zf58alq92snn7js27tssxfeuqh', 'bc1qx7udtlqxgfpe5tdz8upgt69umg54tgkvurr4al9zrfed0cg4rgxqr04p23',
      'bc1q55hfcx99h7lrx2u2qw0ft4rvlmd3up7rjjqe3u3mzaaceuwa7p7s7u6tsm', 'bc1qspqd0rsk2y74g3tmtxz4vht26sn9pe23hpzf7fqy7t22m5dkd7lsrdggr9',
      'bc1q88uyeykx6gx8t4yc5j5j0srymxfts605stw0r6n93hugmc4jn39szfl4xq', 'bc1qpy9clc84fqec58q6pccchq4zn7l5p3j0yywwqt0hph56cf5dcqtsqux242',
      'bc1qsc0yxkwex9pfecjmqwfymrx66chdlkyhf9mv77ky3zj4at6yl5ms9k7pe7', 'bc1q0mve58tnp9njvt0kl3k5feqlxrsddh5mtenkwqskll9ue76mglrsfr9lr9',
      'bc1q52q0hm4cahq48g4k6s9cszk6aam5akt4gkx0cf0lnzmml28uxxuskuptws', 'bc1q5fqtyqeqxxyjj7cd7y7usvmpypk29eu2ywrx6qc8eepxh28jzv6qh4xv36',
      'bc1qm8erpw06xx4c5xj64r8zpcwndysyn4auztl3r8edx22hy65xx5sswdl459', 'bc1q9r029zz0uzvz5y0k4qmy8n8hgg6666rnnylcg393mfpzpcyc2agschmats',
      'bc1qz7a6hxfgkrk59kszsz3zwytnezuyy2dzqhr5cfevggdra6uw25mq70jhhs', 'bc1qqeayaggvqwa5743nfu8spv23n30lzfz5sufrqk9dg87j7syj7fkscufvpc',
      'bc1qngrjuyeutte59896npeneftad2l7wgrjkyd2rr7pvw4n2vrw89esf23m9d', 'bc1qxa5qk5ffapzq4rgwwlkxd39lm7p68470qgv0r8y43hhud72xwu0q9ppchc',
      'bc1qm4uc7yzrens0psfzzra7ffm8dxcdksr4uxm86ht8exvzf7s88j9qzyyr4y', 'bc1qmkwsy76ltr0cuqvew3njpqglj70yxg50kns4ujl74flwwycnms4s0g8vr8',
      'bc1qn03pr6j96ua93stq9qufysmql2mmpl88rrcl04grx4pupeslx8xq058pv8', 'bc1qac2ufeql6turnkq4cqdyh60x776sns598nqqh65pncamm7ahqlnsn9wkrd',
      'bc1q6en3x6q9d96ya3gvzje4un5mk7kxzpqjefxs094rd7dm5t7gny8sp70rjt', 'bc1q48f368l38g6wqy0x22cl36jv6vg2nft948lnl0ferv05wl5upf7qgtly5z',
      'bc1qqx5r8du9xfm9y95cssjf9axyv9clhl4zageewereedm3l6gvzgjqh9gc30', 'bc1qrdx8m7aj4pw5elepet4r9s2cx2rg37xr3fff2xe8elspm4md3res9ay6ex',
      'bc1q5336khf2ykgg5kcrmyt2rn60x6tlyte9c802hanyma34xmmjsw4q9d7t3j', 'bc1qknw8jf6xn25u8j0myxd2yczmus6du4h3y88v0j4ykqkpxmqrlfdq4uzn79',
      'bc1qu8hh9nalpyh4evleut3jp8hqr6gpu6twfjhlwu2z6t5lc9luwdzq4p5csm', 'bc1q68dyrwly7ntnvc7p6ryupwjx5en60s4lf99z706h7xd4vsnhl7qqcedfl4',
      'bc1qu7cw2daryq5s7hcr3hr4d2due7x6ca0vlf22cuudw02edhv8nn6qe9tnfw', 'bc1qz8aj37hcrktwdmw9geqqk9xkdfvgnu2spvj6272dkedv60kqdkgqah0cz7',
      'bc1qfqyr2vz72d053kttey0hep7zt9xhc5l8crpnldsmt6449pr4nr2sl70fkw', 'bc1qg9wvjfc04vg4c3qm9l77u3wxg54xwazypkrpl09zeyx7dwak4dfqgqmg9c',
      'bc1qs7q3l00pjegd3rex5k8wu4gr7v0qh782jufzvt45mr3qw6uqpkgq9nv4vd', 'bc1q7uqzcdm4zgsjves5uzky047s9zuapzrlezuexvdcpfntgaauewsqx6rhxq',
      'bc1qcdd8l0ddn8jrmgxxv9fq78tpz6ua7u0r96k7cmc5znrar3acvcrqq0vffy', 'bc1qu8gluduq0jpm0rua4z7cjy7n29jjsvn62ungezphg8vnp3dzd2fqe7ndvz',
      'bc1qggwaas0kgfy2unyt67d24prlvm45l4qw7njp38p6gparm6gczl7qdzetw6', 'bc1qt9nse0d8mcda75lq0vk9csygshc328r5autgfe8um2rm2vh6gzwscyemln',
      'bc1qth9a2r50da95dnlkrgw5ldkmhr5z93qpy4xyzyym54vqu2hgjqaqhpjvzn', 'bc1qxt59elm4c8r47t9ydl7ffjcmfpdatsarw4gq4587kryrnwnyatuqlugyn0',
      'bc1qlqp0gqp8kjednmpapg78jqka0ym4jrrvx07das9cqwsr80sgnvvsze92se', 'bc1qlqzvqa62zathntxc54l65ehhd04fgurfa097f0sx0y2l9495m82s2ag66a',
      'bc1q6svg3s5jtgwj2k298wzhz74w7jjlcvuv0lvmlgpq6qce67rxc5lq6dquzl', 'bc1q2sjk0yzc24ndk4004jk5dgml8u39xqywgtsnlx0rp9uw6sdjfglsu7780k',
      'bc1qssmwcgnkvw4xs2s80mhlsz4k86ht45khm834hchgrxm09rqqxxhq94t6ke', 'bc1qwc3k8glf8t62z5wqhavtwwhqpgdjg02h5s6h9t4ll6dvm04tvdmsfgygwm',
      'bc1qc9gxltuhym9zfk2tuxjmxfctzt7f9y2v7xscfautdx9kyfrp6gdqwlr5g3', 'bc1q04m4m8yamkkl3xz9hn67uqa66z9d7gatcrfwcyp39hqqmcx4j7mq6antvw',
      'bc1qfjdq6przqg7n0k2tj6t2ucj35elf3xnaslygewem3d3rhlcpkz4qj8wx32', 'bc1q96xgdxlaeurfaf7hh6h2jnx62daqsdcrygr4j02pa5t9crpgnkgqvxmtn8',
      'bc1qgwhr7n3g3hxqjkxvq7nkjwfzch9lvjen7r87wwv4ghd55wswm9qsmkxj22', 'bc1qvqg038d4fn0deul86as2ym05mdc79w5ztn88x8lakyh9wxzrp6eqnact6r',
      'bc1qlz9aknelqjem372vaz6y30c76rmax5yc2493vfwqpnr6hpsfnc3savdqeg', 'bc1qmr2xlwx7kslv4t2v2l8mhsn5clk7srcsmyy70ywmeznunlu83k5qctez3n',
      'bc1q257vjpgwygngzqu20wx9rlx2dhwxv6skm3zs6nrern7pdlwcmmwq6rs966', 'bc1qa42e4r0zs29pc39l5e73wl4k056r2439h2tv6w4s5f99xxg9qj6qe3ywga',
      'bc1qxzgummsz6efew3mzdhk6853fes693tzh885u3ajw8gp5gp3ca7sqw9fqms', 'bc1qgne92sswr0vmrmdgfxh2jjq07lnndmka8xp6jx3v59guqf268uqqssdzce',
      'bc1qhpvx4l84c93rlp4hxztuxwacag0fgn4cksrc8zadh327z2s2dg3sccg0dw', 'bc1q0xqtyc9rg7f00q2jg5plvls8jfprkpw4uqeu5vuzffec5f5lytuqp4knz2',
      'bc1q92egxq95dcwatt00c9yths6rq4q3e3ncdxgmc8d6emlczrhm509qszanch', 'bc1qheu4njrk5d47r9fegg2h6glcg87sj5cq4eamz6x6zdzp844j3qyqtudjeh',
      'bc1qgfugj75nqh4s8rcus0azsy5tcwv3j5kvctu7akefxflhnj6scvqqlcvxku', 'bc1qnzch6h07l963kgrhxme3w8suw0t6kjjvkwg3nu9se78tr83ynejs4us28y',
      'bc1qehrh8tdhmvg5lfl2nq592frn4wq6erlj0wetnl0577zdf2zs5wxqvs586j', 'bc1qr59506srl76ww5wer6ct9tdh6k3x6lj6wxe9l7tzs8vqfayy9zlqlny6dk',
      'bc1qhschas0jck59yx2m8cmjzgxpal3pjn7stldfly4ygjtjyz3tmg6sytte5u', 'bc1q5z36el22e7expy6cv909w4mqfn8623e4jr7wt8qr33pvquktte2qrs68d8',
      'bc1q8plw83cnwdjl2m8f5dcn9ddjgnrsgfs9vqrhwj02u44huuf8y5nqmunesv', 'bc1qzs8lghvfakxg6s7ff32djyph45nx4f7ekuzs7fa5sh9c0f2t5sqqeh5qv7',
      'bc1q0dn0dmvz02v85d2hf6ewprayrzcv8c6dhzafvmvcr8p4sgzr6hqs4new5u', 'bc1qlmvrcw9e57k2eydmw0w9xcfxjze835m8zndydzqanms3alc6e07su3w0xy',
      'bc1q3ak4lx7fqhwfmppg450an3ww3a625vjm6w90ln6e6kl9p4au9vss5vflsc', 'bc1qdq4sexst5rmz7ee0t8r02tf27w9e3l75ylw7tag0gxnnc00jgmtqykxqs6',
      'bc1q367ypf08x62fqcs49ggn5nc9tlv8fnkuqrj4cnl0ttzprvgytt3qw0yqyn', 'bc1qxumgmru7zqp8e6yvq8gxznqedkxm4qscuul8zyucw3wwynjmxrzsqtzaq6',
      'bc1qu66xv8w67akypxs82pslhek75t8lne9mcf08c8afse552m9dtwmq92xy8a', 'bc1qkrpnu4wmgxdslxtxt8lvlf8z5tqc73vpd8fhygn6r5zpydp3trtq4gksc0',
      'bc1q8e2064au4evcz0emlu953dt4v5frszdhhtmn83fqvm5v3zfc9p5qh2hzlq', 'bc1q5qyy8myv5fp2320ju9pd7qd642z5yy8xrtcdvsaplnta50g08k3skjc86u',
      'bc1q5afm3gphuledrlkh087ctcfcv5kvend89r43uf8d2euhk6t9ymhsmwvd03', 'bc1qs0hglfq77gcxjhkmtt7fm79x53ha0fvl3hk23xx3sdvhke6n4fjsahfckj',
      'bc1qelmf0v2pdywwwwuvtuzy03l57pkvffp7q2a7kj9pw6yd258aw8mqr83870', 'bc1qsdawrjcjf4kk854rx8qsxr8dlnc5ml25g7mmpurs93mv3j8ncw0smsj8yk',
    ] },
];

// Further entries join the same way each of these did: the address confirmed
// against its primary public source -- the owner's own publication, the
// filing, the proof, the indictment -- never from memory, and its checksum
// verified before it is written down. Public-already is a criterion and not
// an assumption: an address that cannot be sourced to a public record does
// not belong on this shelf, however interesting its history.
