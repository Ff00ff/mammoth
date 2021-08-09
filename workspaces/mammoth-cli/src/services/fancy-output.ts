import * as Spinnies from 'spinnies';
import * as chalk from 'chalk';
import * as figures from 'figures';

type SpinnerState = 'pending' | 'spinning' | 'failed' | 'succeeded';
interface Spinner {
  index: number;
  state: SpinnerState;
  text: string;
  annotation?: string;
}

export type FancyOutput = ReturnType<typeof makeFancyOutput>;
export type MakeFancyOutput = typeof makeFancyOutput;

export const makeFancyOutput = (...texts: string[]) => {
  const spinnies = new Spinnies({
    spinnerColor: chalk.hex(`#FFEA00`),
    succeedPrefix: chalk.bold(figures.tick),
    failPrefix: chalk.bold(figures.cross),
  });
  let activeSpinner = 0;

  let spinners: Spinner[] = texts.map((text, index) => ({
    index,
    state: index === 0 ? `spinning` : `pending`,
    text,
    annotation: undefined,
  }));

  const removeAllSpinners = () => {
    for (const spinner of spinners) {
      spinnies.remove(`spinner-${spinner.index}`);
    }
  };

  const toState = (spinnerState: SpinnerState) => {
    return spinnerState === `spinning`
      ? `spinning`
      : spinnerState === `succeeded`
      ? `succeed`
      : spinnerState === `failed`
      ? `fail`
      : `stopped`;
  };

  const createSpinners = () => {
    removeAllSpinners();

    for (const spinner of spinners) {
      spinnies.add(`spinner-${spinner.index}`, {
        text: chalk.bold(spinner.text),
        succeedColor: `white`,
        indent: spinner.state === `pending` ? 2 : 0,
        status: toState(spinner.state),
      });

      if (spinner.annotation) {
        spinnies.add(`spinner-${spinner.index}-annotation`, {
          text: spinner.annotation,
          color: `gray`,
          indent: 2,
          status: `stopped`,
        });
      }
    }
  };

  createSpinners();

  return {
    update(text: string) {
      spinners[activeSpinner].text = text;

      spinnies.update(`spinner-${activeSpinner}`, {
        status: `spinning`,
        indent: 0,
        text: chalk.bold(text),
      });
    },

    annotate(type: string, text: string) {
      spinners[activeSpinner].annotation = `${type} ${text}`;

      if (spinnies.pick(`spinner-${activeSpinner}-annotation`)) {
        spinnies.update(`spinner-${activeSpinner}-annotation`, {
          text: spinners[activeSpinner].annotation,
          status: `stopped`,
        });
      } else {
        createSpinners();
      }
    },

    succeed(previousText: string, nextText?: string, nextState: SpinnerState = `spinning`) {
      spinners[activeSpinner].text = previousText;
      spinners[activeSpinner].state = `succeeded`;

      if (spinners[activeSpinner].annotation) {
        spinners[activeSpinner].annotation = undefined;

        spinnies.remove(`spinner-${activeSpinner}-annotation`);
      }

      if (nextText) {
        spinners[activeSpinner + 1].text = nextText;
        spinners[activeSpinner + 1].state = nextState;

        spinnies.update(`spinner-${activeSpinner + 1}`, {
          status: toState(nextState),
          indent: 0,
          text: chalk.bold(nextText),
        });
      }

      spinnies.succeed(`spinner-${activeSpinner}`, {
        text: chalk.bold(previousText),
      });

      activeSpinner++;
    },

    error(text: string) {
      spinners[activeSpinner].text = text;
      spinners[activeSpinner].state = `failed`;

      const removedSpinners = spinners.splice(activeSpinner + 1, spinners.length - activeSpinner);
      removedSpinners.forEach((spinner) => {
        spinnies.remove(`spinner-${spinner.index}`);

        if (spinner.annotation) {
          spinnies.remove(`spinner-${spinner.index}-annotation`);
        }
      });

      if (spinners[activeSpinner].annotation) {
        spinners[activeSpinner].annotation = undefined;
        spinnies.remove(`spinner-${activeSpinner}-annotation`);
      }

      spinnies.fail(`spinner-${activeSpinner}`, { text: chalk.bold(text) });
    },

    clear() {
      spinnies.stopAll();

      removeAllSpinners();
    },
  };
};
