import { potentiallyHarmful, potentiallyHarmfulUnless } from "./feedbackStrings";
import { followedByExcept } from "../helpers/followedByExcept";

const derogatory = "Avoid using \"%1$s\" as it is derogatory. Consider using \"%2$s\" instead.";

const medicalCondition = "Avoid using \"%1$s\" unless talking about the specific medical condition. " +
	"If you are not referencing the medical condition, consider other alternatives to describe the trait or behavior such as \"%2$s\".";
const medicalConditionTwoAlternatives = "Avoid using \"%1$s\" unless talking about the specific medical condition (in which case, use \"%2$s\"). " +
	"If you are not referencing the medical condition, consider other alternatives to describe the trait or behavior such as \"%3$s\".";

const potentiallyHarmfulTwoAlternatives = "Avoid using \"%1$s\" as it is potentially harmful. " +
	"Consider using \"%2$s\" instead, or \"%3$s\" when using it to describe someone in terms of their disability.";

const disabilityAssessments =  [
	{
		identifier: "binge",
		nonInclusivePhrases: [ "bingeing", "binge" ],
		inclusiveAlternatives: "indulging, satuating, wallowing",
		score: 6,
		feedbackFormat: medicalCondition,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "wheelchairBound",
		nonInclusivePhrases: [ "wheelchair-bound", "wheelchair bound", "confined to a wheelchair" ],
		inclusiveAlternatives: "uses a wheelchair/wheelchair user",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "mentallyRetarded",
		nonInclusivePhrases: [ "mentally retarded" ],
		inclusiveAlternatives: "person with an intellectual disability",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		// Problematic, as it will also target the above phrase
		identifier: "retarded",
		nonInclusivePhrases: [ "retarded" ],
		inclusiveAlternatives: "uninformed, ignorant, foolish, irrational, insensible",
		score: 3,
		feedbackFormat: derogatory,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "alcoholic",
		nonInclusivePhrases: [ "an alcoholic" ],
		inclusiveAlternatives: "person with alcohol use disorder",
		score: 6,
		feedbackFormat: potentiallyHarmfulUnless,
		learnMoreUrl: "https://yoa.st/",
		rule: ( words, inclusivePhrase ) => followedByExcept( words, inclusivePhrase, [ "drink", "beverage" ] ),
	},
	{
		identifier: "alcoholics",
		nonInclusivePhrases: [ "alcoholics" ],
		inclusiveAlternatives: "person with alcohol use disorder",
		score: 6,
		feedbackFormat: potentiallyHarmfulUnless,
		learnMoreUrl: "https://yoa.st/",
		rule: ( words, inclusivePhrase ) => followedByExcept( words, inclusivePhrase, [ "anonymous" ] ),
	},
	{
		identifier: "cripple",
		nonInclusivePhrases: [ "a cripple" ],
		inclusiveAlternatives: "person with a physical disability",
		score: 3,
		feedbackFormat: derogatory,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "crippled",
		nonInclusivePhrases: [ "crippled" ],
		inclusiveAlternatives: "has a physical disability",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "daft",
		nonInclusivePhrases: [ "daft" ],
		inclusiveAlternatives: "dense, ignorant, foolish",
		score: 6,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "handicapped",
		nonInclusivePhrases: [ "handicapped" ],
		inclusiveAlternatives: "disabled, disabled person, person with a disability",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "handicap",
		nonInclusivePhrases: [ "handicap" ],
		inclusiveAlternatives: "disability",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "insane",
		nonInclusivePhrases: [ "insane" ],
		inclusiveAlternatives: "wild, confusing, unpredictable, impulsive, reckless, risk-taker, out of control, " +
			"unbelievable, incomprehensible, irrational, nonsensical, outrageous, ridiculous",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "imbecile",
		nonInclusivePhrases: [ "imbecile" ],
		inclusiveAlternatives: "uninformed, ignorant, foolish",
		score: 3,
		feedbackFormat: derogatory,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "specialNeeds",
		nonInclusivePhrases: [ "special needs" ],
		inclusiveAlternatives: [ "functional needs, support needs", "disabled, disabled person, person with a disability" ],
		score: 3,
		feedbackFormat: potentiallyHarmfulTwoAlternatives,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "hardOfHearing",
		nonInclusivePhrases: [ "hard-of-hearing" ],
		inclusiveAlternatives: "hard of hearing, partially deaf, has partial hearing loss",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "hearingImpaired",
		nonInclusivePhrases: [ "hearing impaired" ],
		inclusiveAlternatives: "deaf or hard of hearing, partially deaf, has partial hearing loss",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "functioning",
		nonInclusivePhrases: [ "high functioning", "low functioning" ],
		inclusiveAlternatives: "",
		score: 6,
		feedbackFormat: "Avoid using \"%1$s\" as it is potentially harmful unless to refer to yourself or how you characterize your condition." +
			"Consider using a specific characteristic or experience if it is known.",
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "autismHigh",
		nonInclusivePhrases: [ "high functioning autism", "high-functioning autism" ],
		inclusiveAlternatives: "autism with low support needs",
		score: 3,
		feedbackFormat: potentiallyHarmfulUnless,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "autismLow",
		nonInclusivePhrases: [ "low functioning autism", "low-functioning autism" ],
		inclusiveAlternatives: "autism with high support needs",
		score: 3,
		feedbackFormat: potentiallyHarmfulUnless,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "lame",
		nonInclusivePhrases: [ "lame" ],
		inclusiveAlternatives: "boring, uninteresting, uncool",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "suicide",
		nonInclusivePhrases: [ "commit suicide", "committed suicide" ],
		inclusiveAlternatives: "took their life, died by suicide, killed themself",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "handicapParking",
		nonInclusivePhrases: [ "handicap parking", "disabled parking" ],
		inclusiveAlternatives: "accessible parking",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "fellOnDeafEars",
		nonInclusivePhrases: [ "fell on deaf ears" ],
		inclusiveAlternatives: "was not addressed",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "turnOnBlindEye",
		nonInclusivePhrases: [ "turn a blind eye" ],
		inclusiveAlternatives: "ignore",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "blindLeadingBlind",
		nonInclusivePhrases: [ "the blind leading the blind" ],
		inclusiveAlternatives: "ignorant, insensitive, misguided",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "disabledBathroom",
		nonInclusivePhrases: [ "disabled bathroom", "disabled bathrooms", "handicap bathroom", "handicap bathrooms" ],
		inclusiveAlternatives: "accessible bathroom(s)",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "disabledToilet",
		nonInclusivePhrases: [ "disabled toilet", "disabled toilets", "handicap toilet", "handicap toilets" ],
		inclusiveAlternatives: "accessible toilet(s)",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "disabledStall",
		nonInclusivePhrases: [ "disabled stall", "disabled stalls", "handicap stall", "handicap stalls" ],
		inclusiveAlternatives: "accessible stall(s)",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "dumb",
		nonInclusivePhrases: [ "dumb" ],
		inclusiveAlternatives: [ "uninformed, ignorant, foolish, inconsiderate, insensible, irrational, reckless " +
			"(if used in the same sense as 'stupid')", "deaf people who don't speak" ],
		score: 3,
		feedbackFormat: potentiallyHarmfulTwoAlternatives,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "deaf",
		nonInclusivePhrases: [ "deaf-mute", "deaf and dumb" ],
		inclusiveAlternatives: "deaf",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "addict",
		nonInclusivePhrases: [ "addict" ],
		inclusiveAlternatives: "person with a (drug, alcohol, ...) addiction / person with substance abuse disorder",
		score: 6,
		feedbackFormat: potentiallyHarmfulUnless,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "addicts",
		nonInclusivePhrases: [ "addicts" ],
		inclusiveAlternatives: "people with a (drug, alcohol, ...) addiction / people with substance abuse disorder",
		score: 6,
		feedbackFormat: potentiallyHarmfulUnless,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "brainDamaged",
		nonInclusivePhrases: [ "brain-damaged" ],
		inclusiveAlternatives: "person with a (traumatic) brain injury",
		score: 6,
		feedbackFormat: potentiallyHarmfulUnless,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "differentlyAbled",
		nonInclusivePhrases: [ "differently abled", "differently-abled" ],
		inclusiveAlternatives: "disabled, disabled person, person with a disability",
		score: 6,
		feedbackFormat: potentiallyHarmfulUnless,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "epilepticFit",
		nonInclusivePhrases: [ "epileptic fit" ],
		inclusiveAlternatives: "seizure",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "sanityCheck",
		nonInclusivePhrases: [ "sanity check" ],
		inclusiveAlternatives: "final check; confidence check; rationality check; soundness check; OR be specific about what you're checking",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "crazy",
		nonInclusivePhrases: [ "crazy" ],
		inclusiveAlternatives: "baffling, startling, surprising, shocking, wild, confusing, unpredictable",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "psychopathic",
		nonInclusivePhrases: [ "psychopath", "psychopathic" ],
		inclusiveAlternatives: "selfish, toxic, manipulative, wild, confusing, unpredictable, impulsive, reckless, out of control",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "schizophrenic",
		nonInclusivePhrases: [ "schizophrenic" ],
		inclusiveAlternatives: "of two minds, chaotic, confusing",
		score: 6,
		feedbackFormat: medicalCondition,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "bipolar",
		nonInclusivePhrases: [ "bipolar" ],
		inclusiveAlternatives: "of two minds, chaotic, confusing",
		score: 6,
		feedbackFormat: medicalCondition,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "paranoid",
		nonInclusivePhrases: [ "paranoid" ],
		inclusiveAlternatives: "overly suspicious, unreasonable, defensive",
		score: 6,
		feedbackFormat: medicalCondition,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "manic",
		nonInclusivePhrases: [ "manic" ],
		inclusiveAlternatives: "excited, raving, unbalanced, wild",
		score: 6,
		feedbackFormat: medicalCondition,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "hysterical",
		nonInclusivePhrases: [ "hysterical" ],
		inclusiveAlternatives: "intense, vehement, piercing, chaotic",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "psycho",
		nonInclusivePhrases: [ "psycho" ],
		inclusiveAlternatives: "selfish, toxic, manipulative, wild, confusing, unpredictable, impulsive, reckless, out of control",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "neurotic",
		nonInclusivePhrases: [ "neurotic", "lunatic" ],
		inclusiveAlternatives: "baffling, startling, surprising, shocking, wild, confusing, unpredictable",
		score: 3,
		feedbackFormat: potentiallyHarmful,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "sociopath",
		nonInclusivePhrases: [ "sociopath" ],
		inclusiveAlternatives: [ "Person with antisocial personality disorder",
			"selfish, toxic, manipulative, wild, confusing, unpredictable, impulsive, reckless, out of control" ],
		score: 6,
		feedbackFormat: medicalConditionTwoAlternatives,
		learnMoreUrl: "https://yoa.st/",
	},
	{
		identifier: "narcissistic",
		nonInclusivePhrases: [ "narcissistic" ],
		inclusiveAlternatives: [ "Person with narcissistic personality disorder",
			"selfish, egotistical, self-centered, self-absorbed, vain, toxic, manipulative" ],
		score: 6,
		feedbackFormat: medicalConditionTwoAlternatives,
		learnMoreUrl: "https://yoa.st/",
	},
];

export default disabilityAssessments;

