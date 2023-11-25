import React from "react";
import Head from "next/head";
import Image from "next/image";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { Combobox } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { COUNTRIES, getRandomCountry, type Country } from "~/utils/countries";
import { arrowToAnswer, distance, MAX_DISTANCE } from "~/utils/geo";

type Guess = {
  country: Country;
  distance: number;
  arrow: string;
};

type GameState = "PLAYING" | "WON" | "LOST";

export default function Home({
  country: answer,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // const [answer, setAnswer] = React.useState(getRandomCountry());
  const [guessed, setGuessed] = React.useState<Guess[]>([]);
  const [selected, setSelected] = React.useState<Country | null>();
  const [gameState, setGameState] = React.useState<GameState>("PLAYING");

  function handleGuess() {
    // invalid guess
    if (!selected || guessed.find((guess) => guess.country === selected)) {
      return;
    }

    const dist = distance(selected, answer);
    const arrow = arrowToAnswer(selected, answer);
    setGuessed((cur) => [...cur, { country: selected, distance: dist, arrow }]);
  }

  React.useEffect(() => {
    setSelected(null);

    if (guessed.length === 0) {
      return;
    } else if (guessed[guessed.length - 1]?.country.code === answer.code) {
      setGameState("WON");
      toast.success("You won! Yay!");
      return;
    } else if (guessed.length === 6) {
      setGameState("LOST");
      toast.error(`You'll get it next time. The answer was ${answer.name}`);
      return;
    }

    document.querySelector("input")?.focus();
  }, [guessed]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-[#212121]">
        <ToastContainer position="top-center" theme="dark" />

        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center gap-6 p-6">
          <h1 className="text-3xl text-white lg:text-4xl">
            WOR<span className="text-[#080]">L</span>DLE UN
            <span className="text-[#080]">L</span>IMITED
          </h1>
          <CountryImage countryCode={answer.code} />

          <div className="flex w-full flex-col gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              return <GuessDisplay key={i} guess={guessed[i]} />;
            })}
          </div>

          <div className="w-full">
            <Combo
              setSelected={setSelected}
              selected={selected}
              disabled={gameState !== "PLAYING"}
            />
            <button
              className="mt-3 w-full rounded bg-green-700 p-2 font-bold uppercase text-white"
              onClick={
                gameState === "PLAYING"
                  ? () => handleGuess()
                  : () => window.location.reload()
              }
            >
              {gameState === "PLAYING" ? "Guess" : "Next Game"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  country: Country;
}> = async () => {
  return { props: { country: getRandomCountry() } };
};

type GuessDisplayProps = {
  guess?: Guess;
};

const GuessDisplay = ({ guess }: GuessDisplayProps) => {
  if (!guess) {
    return <div className="rounded bg-[#fafafa] p-4"></div>;
  }

  return (
    <div className="flex gap-1">
      <span className="flex-1 rounded border border-black bg-[#fafafa] p-1">
        {guess.country.name}
      </span>
      <span className="rounded border border-black bg-[#fafafa] p-1">
        {Math.round(guess.distance)} km
      </span>
      <span className="rounded border border-black bg-[#fafafa] p-1">
        {guess.arrow}
      </span>
      <span className="rounded border border-black bg-[#fafafa] p-1">
        {Math.round((1 - guess.distance / MAX_DISTANCE) * 100)}%
      </span>
    </div>
  );
};

type ComboProps = {
  disabled?: boolean;
  selected?: Country | null;
  setSelected: React.Dispatch<React.SetStateAction<Country | null | undefined>>;
};

const Combo = ({ disabled, selected, setSelected }: ComboProps) => {
  const [query, setQuery] = React.useState("");
  const filteredCountries =
    query === ""
      ? COUNTRIES
      : COUNTRIES.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <Combobox
      value={selected}
      onChange={setSelected}
      disabled={disabled}
      as="div"
      className="relative"
      nullable={true}
    >
      <Combobox.Input
        onChange={(e) => setQuery(e.target.value)}
        displayValue={(c: Country | undefined) => c?.name ?? ""}
        autoComplete="off"
        className="w-full rounded p-2 uppercase"
        autoFocus={true}
      />
      <Combobox.Options className="absolute left-0 z-10 max-h-32 w-full origin-top-left divide-y divide-gray-300 overflow-y-scroll rounded-md border border-gray-300 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        {filteredCountries.map((x) => (
          <Combobox.Option key={x.code} value={x} className="p-2">
            {x.name}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
  );
};

type ImageProps = {
  countryCode: string;
};

const CountryImage = ({ countryCode }: ImageProps) => {
  const src = `/assets/${countryCode.toLowerCase()}.svg`;

  return (
    <Image
      alt="Location to guess!"
      width={300}
      height={300}
      src={src}
      className="my-5 invert"
    />
  );
};
