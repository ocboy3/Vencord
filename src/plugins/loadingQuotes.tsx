/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { DataStore } from "@api/index";
import { addPreSendListener, removePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import { useForceUpdater } from "@utils/react";
import definePlugin, { OptionType } from "@utils/types";
import { Button, Forms, React, TextInput, useState } from "@webpack/common";

// import { definePluginSettings, Settings } from "@api/Settings";
// import { Devs } from "@utils/constants";
// import definePlugin, { OptionType } from "@utils/types";
// import settings from "./_core/settings";

// These are Xor encrypted to prevent you from spoiling yourself when you read the source code.
// don't worry about it :P
const quotes = [
    "Eyrokac",
    "Rdcg$l`'k|~n",
    'H`tf$d&iajo+d`{"',
    "Sucqplh`(Eclhualva()&",
    "Lncgmka'8KNMDC,shpanf'`x./,",
    "Ioqweijnfn*IeuvfvAotkfxo./,",
    'Hd{#cp\x7Ft$)nbd!{lq%mig~*\x7Fh`v#mk&sm{gx nd#idjb(a\x7Ffao"bja&amdkge!Rloìkhf)hyedfjjb*\'^hzdrdmm$lu\'|ao+mnqw$fijxh~bbmg#Tjmîefd+fnp#lpkffz5',
    "h",
    "sijklm&cam*rot\"hjjq'|ak\x7F xmv#wc'ep*mawmvvlrb(|ynr>\"Aqq&cgg-\x7F ugoh%rom)e\x7Fhdpp%$",
    'Tnfb}"u\'~`nno!kp$vvhfzeyee"a}%Tfam*Xh`fls%Jboldos-"lj`&hn)~ce!`jcbct|)gdbhnf$wikm$zgaxkmc%afely+og"144?\'ign+iu%p$qisiefr gpfa$',
    "Ndtfv%ahfgk+ghtf$|ir(|z' Oguaw&`ggdj mgw$|ir(me|n",
    "(!ͣ³$͙ʐ'ͩ¹#",
    "(ﾈ◗ロ◑,ﾏ-2ｬﾕ✬",
    "Ynw#hjil(ze+psgwp|&sgmkr!",
    "Tikmolh`(fl+a!dvjk\x7F'y|e\x7Fe/,-",
    "3/3750?5><9>885:7",
    "mdmt",
    "Wdn`khc+(oxbeof",
    'Ig"zkp*\'g{*xolglj`&~g|*gowg/$mgt(Eclm`.#ticf{l*xed"wl`&Kangj igbhqn\'d`dn `v#lqrw{3%$bhv-h|)kangj_imwhlhb',
    "Tscmw%Tnoa~x",
    "I‘f#npus(ec`e!vl$lhsm{`ncu\"ekw&f(defeov-$Rnf|)sdu‘pf$wcam{ceg!vl$du'D`d~x-\"jw%oi(okht-\"DJP)Kags,!mq$du'A‐|n sg`akrkq)~jkdl#pj&diefbnf\"jp)&@F\\*{ltq#Hlhrp'",
    "Ynw$v`&cg`dl fml`%rhlhs*",
    "Dnl$p%qhz{s' hv$w%hh|aceg!;#gpvt(fl+cndea`&dg|fon&v#wjjqm(",
    "\ud83d)pft`gs(ec`e!13$qojmz#",
    "a!njcmr'ide~nu\"lb%rheoedldpz$lu'gbkr",
    "dn\"zkp&kgo4",
    "hnpqkw",
    "sn\"fau",
    "Sn\"tmqnh}}*musvkaw&flf&+ldv$w%lr{}*aulr#vlao|)cetn\"jp$",
    "Dxkmc%ot(hhxomwwai'{hln",
    "hd{#}js&(pe~'sg#gprb(3#\"",
    "hd{b${",
    "<;vqkijbq33271:56<3799?24944:",
    "Thof$lu'ofdn,!qsefc'az*bnrcma+&Om{o+iu\"`khct$)bnrd\"bcdoi&",
    "snofplkb{)c'r\"lod'|f*aurv#cpno`abchijklmno"
];

// Kinda took the inspiration for the multiple entry boxes from TextReplace
// becaue I couldn't type in multiple lines in a string area.

interface QuoteEntry {
    text: string;
}

const makeEmptyQuote: () => QuoteEntry = () => ({
    text: "",
});
const makeEmptyQuoteArray = () => [makeEmptyQuote()];

let emptyQuoteArray = makeEmptyQuoteArray();
const QUOTES_LIST_KEY = "LoadingQuotes_QuotesList";

const settings = definePluginSettings({
    useDefaultQuotes: {
        description: "Use plugin's default quotes alongside your own ones",
        type: OptionType.BOOLEAN,
        default: true
    },
    customQuotesList: {
        description: "Your custom quotes list",
        type: OptionType.COMPONENT,
        component: () => {
            return (
                <>
                    <QuotesList
                        title="Quotes"
                        quotesArray={regexRules}
                        key={QUOTES_LIST_KEY}
                    />
                </>
            );
        }
    }
});

function Input({ initialValue, onChange, placeholder }: {
    placeholder: string;
    initialValue: string;
    onChange(value: string): void;
}) {
    const [value, setValue] = useState(initialValue);
    return (
        <TextInput
            placeholder={placeholder}
            value={value}
            onChange={setValue}
            spellCheck={false}
            onBlur={() => value !== initialValue && onChange(value)}
        />
    );
}

function QoutesList({ title, quotesArray, key }: TextReplaceProps) {
    async function onClickRemove(index: number) {
        if (index === quotesArray.length - 1) return;
        quotesArray.splice(index, 1);

        await DataStore.set(key, quotesArray);
        update();
    }

    async function onChange(e: string, index: number, key: string) {
        if (index === quotesArray.length - 1)
            quotesArray.push(makeEmptyQuote());

        rulesArray[index][key] = e;

        if (quotesArray[index].text === "" && index !== quotesArray.length - 1)
            quotesArray.splice(index, 1);

        await DataStore.set(key, quotesArray);
        update();
    }

    return (
        <>
            <Forms.FormTitle tag="h4">{title}</Forms.FormTitle>
            <Flex flexDirection="column" style={{ gap: "0.5em" }}>
                {
                    quotesAeray.map((quote, index) =>
                        <React.Fragment key={`${quote.text}-${index}`}>
                            <Flex flexDirection="row" style={{ gap: 0 }}>
                                <Flex flexDirection="row" style={{ flexGrow: 1, gap: "0.5em" }}>
                                    <Input
                                        placeholder="Text"
                                        initialValue={quote.text}
                                        onChange={e => onChange(e, index, "text")}
                                    />
                                </Flex>
                                <Button
                                    size={Button.Sizes.MIN}
                                    onClick={() => onClickRemove(index)}
                                    style={{
                                        background: "none",
                                        ...(index === quotesArray.length - 1
                                            ? {
                                                visibility: "hidden",
                                                pointerEvents: "none"
                                            }
                                            : {}
                                        )
                                    }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <title>Delete Qoute</title>
                                        <path fill="var(--status-danger)" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z" />
                                        <path fill="var(--status-danger)" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z" />
                                    </svg>
                                </Button>
                            </Flex>
                        </React.Fragment>
                    )
                }
            </Flex>
        </>
    );
};

export default definePlugin({
    name: "LoadingQuotes",
    description: "Replace Discord's loading quotes",
    authors: [Devs.Ven, Devs.KraXen72, Devs.OCbwoy3],
    settings,
    patches: [
        {
            find: ".LOADING_DID_YOU_KNOW",
            replacement: {
                match: /\._loadingText=.+?random\(.+?;/s,
                replace: "._loadingText=$self.quote;",
            },
        },
    ],

    xor(quote: string) {
        const key = "read if cute";
        const codes = Array.from(quote, (s, i) => s.charCodeAt(0) ^ (i % key.length));
        return String.fromCharCode(...codes);
    },

    get quote() {
        var quotesListToUse = [];
        if (settings.store.useDefaultQuotes) {
            quotes.forEach((quoteToAdd) => {
                quotesListToUse.push(this.xor(quoteToPush));
            });
        };

        //async function getQuotesList() {
        //    return (await DataStore.get(QUOTES_LIST_KEY)) ?? makeEmptyQuoteArray();
        //}

        var quotesListData = []; //this.getQuoteList(); //await DataStore.get(QUOTES_LIST_KEY) ?? makeEmptyQuoteArray();
        console.log(quotesListData);

        return quotesListToUse[Math.floor(Math.random() * quotesListToUse.length)];
    }
});
