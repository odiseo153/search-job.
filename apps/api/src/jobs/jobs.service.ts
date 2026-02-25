import { OnModuleInit, Injectable, Logger } from '@nestjs/common';
import {
  Site, ScraperInputDto, JobPostDto, JobResponseDto, IScraper,
  Country, SalarySource, CompensationDto,
} from '@ever-jobs/models';
import { extractSalary, convertToAnnual } from '@ever-jobs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../metrics/metrics.service';
import { LinkedInService } from '@ever-jobs/source-linkedin';
import { IndeedService } from '@ever-jobs/source-indeed';
import { GlassdoorService } from '@ever-jobs/source-glassdoor';
import { ZipRecruiterService } from '@ever-jobs/source-ziprecruiter';
import { GoogleService } from '@ever-jobs/source-google';
import { BaytService } from '@ever-jobs/source-bayt';
import { NaukriService } from '@ever-jobs/source-naukri';
import { BDJobsService } from '@ever-jobs/source-bdjobs';
import { InternshalaService } from '@ever-jobs/source-internshala';
import { ExaService } from '@ever-jobs/source-exa';
import { UpworkService } from '@ever-jobs/source-upwork';
import { AshbyService } from '@ever-jobs/source-ats-ashby';
import { GreenhouseService } from '@ever-jobs/source-ats-greenhouse';
import { LeverService } from '@ever-jobs/source-ats-lever';
import { WorkableService } from '@ever-jobs/source-ats-workable';
import { SmartRecruitersService } from '@ever-jobs/source-ats-smartrecruiters';
import { RipplingService } from '@ever-jobs/source-ats-rippling';
import { WorkdayService } from '@ever-jobs/source-ats-workday';
import { AmazonService } from '@ever-jobs/source-company-amazon';
import { AppleService } from '@ever-jobs/source-company-apple';
import { MicrosoftService } from '@ever-jobs/source-company-microsoft';
import { NvidiaService } from '@ever-jobs/source-company-nvidia';
import { TikTokService } from '@ever-jobs/source-company-tiktok';
import { UberService } from '@ever-jobs/source-company-uber';
import { CursorService } from '@ever-jobs/source-company-cursor';
import { RemoteOkService } from '@ever-jobs/source-remoteok';
import { RemotiveService } from '@ever-jobs/source-remotive';
import { JobicyService } from '@ever-jobs/source-jobicy';
import { HimalayasService } from '@ever-jobs/source-himalayas';
import { ArbeitnowService } from '@ever-jobs/source-arbeitnow';
import { WeWorkRemotelyService } from '@ever-jobs/source-weworkremotely';
import { RecruiteeService } from '@ever-jobs/source-ats-recruitee';
import { TeamtailorService } from '@ever-jobs/source-ats-teamtailor';
import { UsajobsService } from '@ever-jobs/source-usajobs';
import { AdzunaService } from '@ever-jobs/source-adzuna';
import { ReedService } from '@ever-jobs/source-reed';
import { JoobleService } from '@ever-jobs/source-jooble';
import { CareerJetService } from '@ever-jobs/source-careerjet';
import { BambooHRService } from '@ever-jobs/source-ats-bamboohr';
import { PersonioService } from '@ever-jobs/source-ats-personio';
import { JazzHRService } from '@ever-jobs/source-ats-jazzhr';
import { DiceService } from '@ever-jobs/source-dice';
import { SimplyHiredService } from '@ever-jobs/source-simplyhired';
import { WellfoundService } from '@ever-jobs/source-wellfound';
import { StepStoneService } from '@ever-jobs/source-stepstone';
import { MonsterService } from '@ever-jobs/source-monster';
import { CareerBuilderService } from '@ever-jobs/source-careerbuilder';
import { IcimsService } from '@ever-jobs/source-ats-icims';
import { TaleoService } from '@ever-jobs/source-ats-taleo';
import { SuccessFactorsService } from '@ever-jobs/source-ats-successfactors';
import { JobviteService } from '@ever-jobs/source-ats-jobvite';
import { AdpService } from '@ever-jobs/source-ats-adp';
import { UkgService } from '@ever-jobs/source-ats-ukg';
import { GoogleCareersService } from '@ever-jobs/source-company-google';
import { MetaService } from '@ever-jobs/source-company-meta';
import { NetflixService } from '@ever-jobs/source-company-netflix';
import { StripeService } from '@ever-jobs/source-company-stripe';
import { OpenAIService } from '@ever-jobs/source-company-openai';
import { BreezyHRService } from '@ever-jobs/source-ats-breezyhr';
import { ComeetService } from '@ever-jobs/source-ats-comeet';
import { PinpointService } from '@ever-jobs/source-ats-pinpoint';
import { BuiltInService } from '@ever-jobs/source-builtin';
import { SnagajobService } from '@ever-jobs/source-snagajob';
import { DribbbleService } from '@ever-jobs/source-dribbble';
// Phase 8: ATS Expansion
import { ManatalService } from '@ever-jobs/source-ats-manatal';
import { PaylocityService } from '@ever-jobs/source-ats-paylocity';
import { FreshteamService } from '@ever-jobs/source-ats-freshteam';
import { BullhornService } from '@ever-jobs/source-ats-bullhorn';
import { TrakstarService } from '@ever-jobs/source-ats-trakstar';
import { HiringThingService } from '@ever-jobs/source-ats-hiringthing';
import { LoxoService } from '@ever-jobs/source-ats-loxo';
import { FountainService } from '@ever-jobs/source-ats-fountain';
import { DeelService } from '@ever-jobs/source-ats-deel';
import { PhenomService } from '@ever-jobs/source-ats-phenom';
// Phase 8: Company scrapers
import { IbmService } from '@ever-jobs/source-company-ibm';
import { BoeingService } from '@ever-jobs/source-company-boeing';
import { ZoomService } from '@ever-jobs/source-company-zoom';
// Phase 9: Job board expansion
import { TheMuseService } from '@ever-jobs/source-themuse';
import { WorkingNomadsService } from '@ever-jobs/source-workingnomads';
import { FourDayWeekService } from '@ever-jobs/source-4dayweek';
import { StartupJobsService } from '@ever-jobs/source-startupjobs';
import { NoDeskService } from '@ever-jobs/source-nodesk';
import { Web3CareerService } from '@ever-jobs/source-web3career';
import { EchoJobsService } from '@ever-jobs/source-echojobs';
import { JobstreetService } from '@ever-jobs/source-jobstreet';
// Phase 10: Government boards & ATS expansion
import { CareerOneStopService } from '@ever-jobs/source-careeronestop';
import { ArbeitsagenturService } from '@ever-jobs/source-arbeitsagentur';
import { JobylonService } from '@ever-jobs/source-ats-jobylon';
import { HomerunService } from '@ever-jobs/source-ats-homerun';
// Phase 11: Niche boards & developer API expansion
import { HackerNewsService } from '@ever-jobs/source-hackernews';
import { LandingJobsService } from '@ever-jobs/source-landingjobs';
import { FindWorkService } from '@ever-jobs/source-findwork';
import { JobDataApiService } from '@ever-jobs/source-jobdataapi';
// Phase 12: ATS & niche board expansion
import { AuthenticJobsService } from '@ever-jobs/source-authenticjobs';
import { JobScoreService } from '@ever-jobs/source-ats-jobscore';
import { TalentLyftService } from '@ever-jobs/source-ats-talentlyft';
// Phase 13: RSS niche board expansion
import { CryptoJobsListService } from '@ever-jobs/source-cryptojobslist';
import { JobspressoService } from '@ever-jobs/source-jobspresso';
import { HigherEdJobsService } from '@ever-jobs/source-higheredjobs';
import { FossJobsService } from '@ever-jobs/source-fossjobs';
import { LaraJobsService } from '@ever-jobs/source-larajobs';
import { PythonJobsService } from '@ever-jobs/source-pythonjobs';
import { DrupalJobsService } from '@ever-jobs/source-drupaljobs';
import { RealWorkFromAnywhereService } from '@ever-jobs/source-realworkfromanywhere';
import { GolangJobsService } from '@ever-jobs/source-golangjobs';
import { WordPressJobsService } from '@ever-jobs/source-wordpressjobs';
// Phase 14: API-key sources & ATS expansion
import { TalrooService } from '@ever-jobs/source-talroo';
import { InfoJobsService } from '@ever-jobs/source-infojobs';
import { CrelateService } from '@ever-jobs/source-ats-crelate';
import { ISmartRecruitService } from '@ever-jobs/source-ats-ismartrecruit';
import { RecruiterflowService } from '@ever-jobs/source-ats-recruiterflow';
// Phase 15: European government & regional boards
import { JobTechDevService } from '@ever-jobs/source-jobtechdev';
import { FranceTravailService } from '@ever-jobs/source-francetravail';
import { NavJobsService } from '@ever-jobs/source-navjobs';
import { JobsAcUkService } from '@ever-jobs/source-jobsacuk';
import { JobindexService } from '@ever-jobs/source-jobindex';
// Phase 16: Global expansion (LatAm, gig, startup, Canada)
import { GetOnBoardService } from '@ever-jobs/source-getonboard';
import { FreelancerComService } from '@ever-jobs/source-freelancercom';
import { JoinRiseService } from '@ever-jobs/source-joinrise';
import { CanadaJobBankService } from '@ever-jobs/source-canadajobbank';
// Phase 17: Niche & international expansion (NGO, UN, IT)
import { ReliefWebService } from '@ever-jobs/source-reliefweb';
import { UndpJobsService } from '@ever-jobs/source-undpjobs';
import { DevITJobsService } from '@ever-jobs/source-devitjobs';
// Phase 18: Niche RSS expansion (tech, design, environment, regional)
import { PyJobsService } from '@ever-jobs/source-pyjobs';
import { VueJobsService } from '@ever-jobs/source-vuejobs';
import { ConservationJobsService } from '@ever-jobs/source-conservationjobs';
import { CoroflotService } from '@ever-jobs/source-coroflot';
import { BerlinStartupJobsService } from '@ever-jobs/source-berlinstartupjobs';
// Phase 19: Tech niche, crypto, regional expansion
import { RailsJobsService } from '@ever-jobs/source-railsjobs';
import { ElixirJobsService } from '@ever-jobs/source-elixirjobs';
import { CrunchboardService } from '@ever-jobs/source-crunchboard';
import { CryptocurrencyJobsService } from '@ever-jobs/source-cryptocurrencyjobs';
import { HasJobService } from '@ever-jobs/source-hasjob';
// Phase 20: European regional & niche expansion
import { IcrunchdataService } from '@ever-jobs/source-icrunchdata';
import { SwissdevjobsService } from '@ever-jobs/source-swissdevjobs';
import { GermantechjobsService } from '@ever-jobs/source-germantechjobs';
import { VirtualVocationsService } from '@ever-jobs/source-virtualvocations';
import { NoFluffJobsService } from '@ever-jobs/source-nofluffjobs';
// Phase 21: Niche & academic expansion
import { GreenJobsBoardService } from '@ever-jobs/source-greenjobsboard';
import { EurojobsService } from '@ever-jobs/source-eurojobs';
import { OpensourcedesignjobsService } from '@ever-jobs/source-opensourcedesignjobs';
import { AcademiccareersService } from '@ever-jobs/source-academiccareers';
import { RemotefirstjobsService } from '@ever-jobs/source-remotefirstjobs';
// Phase 22: Eastern European, CIS & Singapore expansion
import { DjinniService } from '@ever-jobs/source-djinni';
import { HeadhunterService } from '@ever-jobs/source-headhunter';
import { HabrcareerService } from '@ever-jobs/source-habrcareer';
import { MycareersfutureService } from '@ever-jobs/source-mycareersfuture';
// Phase 23: Japan, Nordic & Swiss expansion
import { JobsInJapanService } from '@ever-jobs/source-jobsinjapan';
import { DuunitoriService } from '@ever-jobs/source-duunitori';
import { JobsChService } from '@ever-jobs/source-jobsch';
// Phase 24: UK & mobile dev expansion
import { GuardianjobsService } from '@ever-jobs/source-guardianjobs';
import { AndroidjobsService } from '@ever-jobs/source-androidjobs';
import { IosdevjobsService } from '@ever-jobs/source-iosdevjobs';
// Phase 25: DevOps niche expansion
import { DevopsjobsService } from '@ever-jobs/source-devopsjobs';
// Phase 25: FP, diversity & niche expansion
import { FunctionalworksService } from '@ever-jobs/source-functionalworks';
import { PowertoflyService } from '@ever-jobs/source-powertofly';
import { ClojurejobsService } from '@ever-jobs/source-clojurejobs';
// Phase 26: Sustainability & niche expansion
import { EcojobsService } from '@ever-jobs/source-ecojobs';
// Phase 27: Asia-Pacific & US tech expansion
import { JobsdbService } from '@ever-jobs/source-jobsdb';
import { TechcareersService } from '@ever-jobs/source-techcareers';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);
  protected readonly scraperMap: Map<Site, IScraper>;

  constructor(
    private readonly linkedInService: LinkedInService,
    private readonly indeedService: IndeedService,
    private readonly glassdoorService: GlassdoorService,
    private readonly zipRecruiterService: ZipRecruiterService,
    private readonly googleService: GoogleService,
    private readonly baytService: BaytService,
    private readonly naukriService: NaukriService,
    private readonly bdJobsService: BDJobsService,
    private readonly internshalaService: InternshalaService,
    private readonly exaService: ExaService,
    private readonly upworkService: UpworkService,
    private readonly ashbyService: AshbyService,
    private readonly greenhouseService: GreenhouseService,
    private readonly leverService: LeverService,
    private readonly workableService: WorkableService,
    private readonly smartRecruitersService: SmartRecruitersService,
    private readonly ripplingService: RipplingService,
    private readonly workdayService: WorkdayService,
    private readonly amazonService: AmazonService,
    private readonly appleService: AppleService,
    private readonly microsoftService: MicrosoftService,
    private readonly nvidiaService: NvidiaService,
    private readonly tiktokService: TikTokService,
    private readonly uberService: UberService,
    private readonly cursorService: CursorService,
    private readonly remoteOkService: RemoteOkService,
    private readonly remotiveService: RemotiveService,
    private readonly jobicyService: JobicyService,
    private readonly himalayasService: HimalayasService,
    private readonly arbeitnowService: ArbeitnowService,
    private readonly weWorkRemotelyService: WeWorkRemotelyService,
    private readonly recruiteeService: RecruiteeService,
    private readonly teamtailorService: TeamtailorService,
    private readonly usajobsService: UsajobsService,
    private readonly adzunaService: AdzunaService,
    private readonly reedService: ReedService,
    private readonly joobleService: JoobleService,
    private readonly careerJetService: CareerJetService,
    private readonly bambooHRService: BambooHRService,
    private readonly personioService: PersonioService,
    private readonly jazzHRService: JazzHRService,
    private readonly diceService: DiceService,
    private readonly simplyHiredService: SimplyHiredService,
    private readonly wellfoundService: WellfoundService,
    private readonly stepStoneService: StepStoneService,
    private readonly monsterService: MonsterService,
    private readonly careerBuilderService: CareerBuilderService,
    private readonly icimsService: IcimsService,
    private readonly taleoService: TaleoService,
    private readonly successFactorsService: SuccessFactorsService,
    private readonly jobviteService: JobviteService,
    private readonly adpService: AdpService,
    private readonly ukgService: UkgService,
    private readonly googleCareersService: GoogleCareersService,
    private readonly metaService: MetaService,
    private readonly netflixService: NetflixService,
    private readonly stripeService: StripeService,
    private readonly openAIService: OpenAIService,
    private readonly breezyHRService: BreezyHRService,
    private readonly comeetService: ComeetService,
    private readonly pinpointService: PinpointService,
    private readonly builtInService: BuiltInService,
    private readonly snagajobService: SnagajobService,
    private readonly dribbbleService: DribbbleService,
    // Phase 8: ATS Expansion
    private readonly manatalService: ManatalService,
    private readonly paylocityService: PaylocityService,
    private readonly freshteamService: FreshteamService,
    private readonly bullhornService: BullhornService,
    private readonly trakstarService: TrakstarService,
    private readonly hiringThingService: HiringThingService,
    private readonly loxoService: LoxoService,
    private readonly fountainService: FountainService,
    private readonly deelService: DeelService,
    private readonly phenomService: PhenomService,
    // Phase 8: Company scrapers
    private readonly ibmService: IbmService,
    private readonly boeingService: BoeingService,
    private readonly zoomService: ZoomService,
    // Phase 9: Job board expansion
    private readonly theMuseService: TheMuseService,
    private readonly workingNomadsService: WorkingNomadsService,
    private readonly fourDayWeekService: FourDayWeekService,
    private readonly startupJobsService: StartupJobsService,
    private readonly noDeskService: NoDeskService,
    private readonly web3CareerService: Web3CareerService,
    private readonly echoJobsService: EchoJobsService,
    private readonly jobstreetService: JobstreetService,
    // Phase 10: Government boards & ATS expansion
    private readonly careerOneStopService: CareerOneStopService,
    private readonly arbeitsagenturService: ArbeitsagenturService,
    private readonly jobylonService: JobylonService,
    private readonly homerunService: HomerunService,
    // Phase 11: Niche boards & developer API expansion
    private readonly hackerNewsService: HackerNewsService,
    private readonly landingJobsService: LandingJobsService,
    private readonly findWorkService: FindWorkService,
    private readonly jobDataApiService: JobDataApiService,
    // Phase 12: ATS & niche board expansion
    private readonly authenticJobsService: AuthenticJobsService,
    private readonly jobScoreService: JobScoreService,
    private readonly talentLyftService: TalentLyftService,
    // Phase 13: RSS niche board expansion
    private readonly cryptoJobsListService: CryptoJobsListService,
    private readonly jobspressoService: JobspressoService,
    private readonly higherEdJobsService: HigherEdJobsService,
    private readonly fossJobsService: FossJobsService,
    private readonly laraJobsService: LaraJobsService,
    private readonly pythonJobsService: PythonJobsService,
    private readonly drupalJobsService: DrupalJobsService,
    private readonly realWorkFromAnywhereService: RealWorkFromAnywhereService,
    private readonly golangJobsService: GolangJobsService,
    private readonly wordPressJobsService: WordPressJobsService,
    // Phase 14: API-key sources & ATS expansion
    private readonly talrooService: TalrooService,
    private readonly infoJobsService: InfoJobsService,
    private readonly crelateService: CrelateService,
    private readonly iSmartRecruitService: ISmartRecruitService,
    private readonly recruiterflowService: RecruiterflowService,
    // Phase 15: European government & regional boards
    private readonly jobTechDevService: JobTechDevService,
    private readonly franceTravailService: FranceTravailService,
    private readonly navJobsService: NavJobsService,
    private readonly jobsAcUkService: JobsAcUkService,
    private readonly jobindexService: JobindexService,
    // Phase 16: Global expansion (LatAm, gig, startup, Canada)
    private readonly getOnBoardService: GetOnBoardService,
    private readonly freelancerComService: FreelancerComService,
    private readonly joinRiseService: JoinRiseService,
    private readonly canadaJobBankService: CanadaJobBankService,
    // Phase 17: Niche & international expansion (NGO, UN, IT)
    private readonly reliefWebService: ReliefWebService,
    private readonly undpJobsService: UndpJobsService,
    private readonly devITJobsService: DevITJobsService,
    // Phase 18: Niche RSS expansion (tech, design, environment, regional)
    private readonly pyJobsService: PyJobsService,
    private readonly vueJobsService: VueJobsService,
    private readonly conservationJobsService: ConservationJobsService,
    private readonly coroflotService: CoroflotService,
    private readonly berlinStartupJobsService: BerlinStartupJobsService,
    // Phase 19: Tech niche, crypto, regional expansion
    private readonly railsJobsService: RailsJobsService,
    private readonly elixirJobsService: ElixirJobsService,
    private readonly crunchboardService: CrunchboardService,
    private readonly cryptocurrencyJobsService: CryptocurrencyJobsService,
    private readonly hasJobService: HasJobService,
    // Phase 20: European regional & niche expansion
    private readonly iCrunchDataService: IcrunchdataService,
    private readonly swissDevJobsService: SwissdevjobsService,
    private readonly germanTechJobsService: GermantechjobsService,
    private readonly virtualVocationsService: VirtualVocationsService,
    private readonly noFluffJobsService: NoFluffJobsService,
    // Phase 21: Niche & academic expansion
    private readonly greenJobsBoardService: GreenJobsBoardService,
    private readonly eurojobsService: EurojobsService,
    private readonly opensourcedesignjobsService: OpensourcedesignjobsService,
    private readonly academiccareersService: AcademiccareersService,
    private readonly remotefirstjobsService: RemotefirstjobsService,
    // Phase 22: Eastern European, CIS & Singapore expansion
    private readonly djinniService: DjinniService,
    private readonly headhunterService: HeadhunterService,
    private readonly habrCareerService: HabrcareerService,
    private readonly myCareersFutureService: MycareersfutureService,
    // Phase 23: Nordic & international expansion
    private readonly duunitoriService: DuunitoriService,
    private readonly jobsInJapanService: JobsInJapanService,
    private readonly jobsChService: JobsChService,
    // Phase 24: UK & mobile dev expansion
    private readonly guardianjobsService: GuardianjobsService,
    private readonly androidjobsService: AndroidjobsService,
    private readonly iosdevjobsService: IosdevjobsService,
    // Phase 25: DevOps niche expansion
    private readonly devopsjobsService: DevopsjobsService,
    // Phase 25: FP, diversity & niche expansion
    private readonly functionalworksService: FunctionalworksService,
    private readonly powertoflyService: PowertoflyService,
    private readonly clojurejobsService: ClojurejobsService,
    // Phase 26: Sustainability & niche expansion
    private readonly ecojobsService: EcojobsService,
    // Phase 27: Asia-Pacific & US tech expansion
    private readonly jobsdbService: JobsdbService,
    private readonly techcareersService: TechcareersService,
    private readonly metrics: MetricsService,
    private readonly configService: ConfigService,
  ) {
    this.scraperMap = new Map<Site, IScraper>([
      [Site.LINKEDIN, this.linkedInService],
      [Site.INDEED, this.indeedService],
      [Site.GLASSDOOR, this.glassdoorService],
      [Site.ZIP_RECRUITER, this.zipRecruiterService],
      [Site.GOOGLE, this.googleService],
      [Site.BAYT, this.baytService],
      [Site.NAUKRI, this.naukriService],
      [Site.BDJOBS, this.bdJobsService],
      [Site.INTERNSHALA, this.internshalaService],
      [Site.EXA, this.exaService],
      [Site.UPWORK, this.upworkService],
      [Site.ASHBY, this.ashbyService],
      [Site.GREENHOUSE, this.greenhouseService],
      [Site.LEVER, this.leverService],
      [Site.WORKABLE, this.workableService],
      [Site.SMARTRECRUITERS, this.smartRecruitersService],
      [Site.RIPPLING, this.ripplingService],
      [Site.WORKDAY, this.workdayService],
      [Site.AMAZON, this.amazonService],
      [Site.APPLE, this.appleService],
      [Site.MICROSOFT, this.microsoftService],
      [Site.NVIDIA, this.nvidiaService],
      [Site.TIKTOK, this.tiktokService],
      [Site.UBER, this.uberService],
      [Site.CURSOR, this.cursorService],
      [Site.REMOTEOK, this.remoteOkService],
      [Site.REMOTIVE, this.remotiveService],
      [Site.JOBICY, this.jobicyService],
      [Site.HIMALAYAS, this.himalayasService],
      [Site.ARBEITNOW, this.arbeitnowService],
      [Site.WEWORKREMOTELY, this.weWorkRemotelyService],
      [Site.RECRUITEE, this.recruiteeService],
      [Site.TEAMTAILOR, this.teamtailorService],
      [Site.USAJOBS, this.usajobsService],
      [Site.ADZUNA, this.adzunaService],
      [Site.REED, this.reedService],
      [Site.JOOBLE, this.joobleService],
      [Site.CAREERJET, this.careerJetService],
      [Site.BAMBOOHR, this.bambooHRService],
      [Site.PERSONIO, this.personioService],
      [Site.JAZZHR, this.jazzHRService],
      [Site.DICE, this.diceService],
      [Site.SIMPLYHIRED, this.simplyHiredService],
      [Site.WELLFOUND, this.wellfoundService],
      [Site.STEPSTONE, this.stepStoneService],
      [Site.MONSTER, this.monsterService],
      [Site.CAREERBUILDER, this.careerBuilderService],
      [Site.ICIMS, this.icimsService],
      [Site.TALEO, this.taleoService],
      [Site.SUCCESSFACTORS, this.successFactorsService],
      [Site.JOBVITE, this.jobviteService],
      [Site.ADP, this.adpService],
      [Site.UKG, this.ukgService],
      // Phase 6: New company scrapers
      [Site.GOOGLE_CAREERS, this.googleCareersService],
      [Site.META, this.metaService],
      [Site.NETFLIX, this.netflixService],
      [Site.STRIPE, this.stripeService],
      [Site.OPENAI, this.openAIService],
      // Phase 6: New ATS integrations
      [Site.BREEZYHR, this.breezyHRService],
      [Site.COMEET, this.comeetService],
      [Site.PINPOINT, this.pinpointService],
      // Phase 7: Additional job boards
      [Site.BUILTIN, this.builtInService],
      [Site.SNAGAJOB, this.snagajobService],
      [Site.DRIBBBLE, this.dribbbleService],
      // Phase 8: ATS Expansion
      [Site.MANATAL, this.manatalService],
      [Site.PAYLOCITY, this.paylocityService],
      [Site.FRESHTEAM, this.freshteamService],
      [Site.BULLHORN, this.bullhornService],
      [Site.TRAKSTAR, this.trakstarService],
      [Site.HIRINGTHING, this.hiringThingService],
      [Site.LOXO, this.loxoService],
      [Site.FOUNTAIN, this.fountainService],
      [Site.DEEL, this.deelService],
      [Site.PHENOM, this.phenomService],
      // Phase 8: Company scrapers
      [Site.IBM, this.ibmService],
      [Site.BOEING, this.boeingService],
      [Site.ZOOM, this.zoomService],
      // Phase 9: Job board expansion
      [Site.THEMUSE, this.theMuseService],
      [Site.WORKINGNOMADS, this.workingNomadsService],
      [Site.FOURDAYWEEK, this.fourDayWeekService],
      [Site.STARTUPJOBS, this.startupJobsService],
      [Site.NODESK, this.noDeskService],
      [Site.WEB3CAREER, this.web3CareerService],
      [Site.ECHOJOBS, this.echoJobsService],
      [Site.JOBSTREET, this.jobstreetService],
      // Phase 10: Government boards & ATS expansion
      [Site.CAREERONESTOP, this.careerOneStopService],
      [Site.ARBEITSAGENTUR, this.arbeitsagenturService],
      [Site.JOBYLON, this.jobylonService],
      [Site.HOMERUN, this.homerunService],
      // Phase 11: Niche boards & developer API expansion
      [Site.HACKERNEWS, this.hackerNewsService],
      [Site.LANDINGJOBS, this.landingJobsService],
      [Site.FINDWORK, this.findWorkService],
      [Site.JOBDATAAPI, this.jobDataApiService],
      // Phase 12: ATS & niche board expansion
      [Site.AUTHENTICJOBS, this.authenticJobsService],
      [Site.JOBSCORE, this.jobScoreService],
      [Site.TALENTLYFT, this.talentLyftService],
      // Phase 13: RSS niche board expansion
      [Site.CRYPTOJOBSLIST, this.cryptoJobsListService],
      [Site.JOBSPRESSO, this.jobspressoService],
      [Site.HIGHEREDJOBS, this.higherEdJobsService],
      [Site.FOSSJOBS, this.fossJobsService],
      [Site.LARAJOBS, this.laraJobsService],
      [Site.PYTHONJOBS, this.pythonJobsService],
      [Site.DRUPALJOBS, this.drupalJobsService],
      [Site.REALWORKFROMANYWHERE, this.realWorkFromAnywhereService],
      [Site.GOLANGJOBS, this.golangJobsService],
      [Site.WORDPRESSJOBS, this.wordPressJobsService],
      // Phase 14: API-key sources & ATS expansion
      [Site.TALROO, this.talrooService],
      [Site.INFOJOBS, this.infoJobsService],
      [Site.CRELATE, this.crelateService],
      [Site.ISMARTRECRUIT, this.iSmartRecruitService],
      [Site.RECRUITERFLOW, this.recruiterflowService],
      // Phase 15: European government & regional boards
      [Site.JOBTECHDEV, this.jobTechDevService],
      [Site.FRANCETRAVAIL, this.franceTravailService],
      [Site.NAVJOBS, this.navJobsService],
      [Site.JOBSACUK, this.jobsAcUkService],
      [Site.JOBINDEX, this.jobindexService],
      // Phase 16: Global expansion (LatAm, gig, startup, Canada)
      [Site.GETONBOARD, this.getOnBoardService],
      [Site.FREELANCERCOM, this.freelancerComService],
      [Site.JOINRISE, this.joinRiseService],
      [Site.CANADAJOBBANK, this.canadaJobBankService],
      // Phase 17: Niche & international expansion (NGO, UN, IT)
      [Site.RELIEFWEB, this.reliefWebService],
      [Site.UNDPJOBS, this.undpJobsService],
      [Site.DEVITJOBS, this.devITJobsService],
      // Phase 18: Niche RSS expansion (tech, design, environment, regional)
      [Site.PYJOBS, this.pyJobsService],
      [Site.VUEJOBS, this.vueJobsService],
      [Site.CONSERVATIONJOBS, this.conservationJobsService],
      [Site.COROFLOT, this.coroflotService],
      [Site.BERLINSTARTUPJOBS, this.berlinStartupJobsService],
      // Phase 19: Tech niche, crypto, regional expansion
      [Site.RAILSJOBS, this.railsJobsService],
      [Site.ELIXIRJOBS, this.elixirJobsService],
      [Site.CRUNCHBOARD, this.crunchboardService],
      [Site.CRYPTOCURRENCYJOBS, this.cryptocurrencyJobsService],
      [Site.HASJOB, this.hasJobService],
      // Phase 20: European regional & niche expansion
      [Site.ICRUNCHDATA, this.iCrunchDataService],
      [Site.SWISSDEVJOBS, this.swissDevJobsService],
      [Site.GERMANTECHJOBS, this.germanTechJobsService],
      [Site.VIRTUALVOCATIONS, this.virtualVocationsService],
      [Site.NOFLUFFJOBS, this.noFluffJobsService],
      // Phase 21: Niche & academic expansion
      [Site.GREENJOBSBOARD, this.greenJobsBoardService],
      [Site.EUROJOBS, this.eurojobsService],
      [Site.OPENSOURCEDESIGNJOBS, this.opensourcedesignjobsService],
      [Site.ACADEMICCAREERS, this.academiccareersService],
      [Site.REMOTEFIRSTJOBS, this.remotefirstjobsService],
      // Phase 22: Eastern European, CIS & Singapore expansion
      [Site.DJINNI, this.djinniService],
      [Site.HEADHUNTER, this.headhunterService],
      [Site.HABRCAREER, this.habrCareerService],
      [Site.MYCAREERSFUTURE, this.myCareersFutureService],
      // Phase 23: Nordic & international expansion
      [Site.DUUNITORI, this.duunitoriService],
      [Site.JOBSINJAPAN, this.jobsInJapanService],
      [Site.JOBSCH, this.jobsChService],
      // Phase 24: UK & mobile dev expansion
      [Site.GUARDIANJOBS, this.guardianjobsService],
      [Site.ANDROIDJOBS, this.androidjobsService],
      [Site.IOSDEVJOBS, this.iosdevjobsService],
      // Phase 25: DevOps niche expansion
      [Site.DEVOPSJOBS, this.devopsjobsService],
      // Phase 25: FP, diversity & niche expansion
      [Site.FUNCTIONALWORKS, this.functionalworksService],
      [Site.POWERTOFLY, this.powertoflyService],
      [Site.CLOJUREJOBS, this.clojurejobsService],
      // Phase 26: Sustainability & niche expansion
      [Site.ECOJOBS, this.ecojobsService],
      // Phase 27: Asia-Pacific & US tech expansion
      [Site.JOBSDB, this.jobsdbService],
      [Site.TECHCAREERS, this.techcareersService],
    ]);
  }

  onModuleInit() {
    this.logger.log(`JobsService initialized with ${this.scraperMap.size} core scrapers`);
  }


  /** ATS scrapers require a companySlug to target a specific company board */
  private static readonly ATS_SITES = new Set<Site>([
    Site.ASHBY,
    Site.GREENHOUSE,
    Site.LEVER,
    Site.WORKABLE,
    Site.SMARTRECRUITERS,
    Site.RIPPLING,
    Site.WORKDAY,
    Site.RECRUITEE,
    Site.TEAMTAILOR,
    Site.BAMBOOHR,
    Site.PERSONIO,
    Site.JAZZHR,
    Site.ICIMS,
    Site.TALEO,
    Site.SUCCESSFACTORS,
    Site.JOBVITE,
    Site.ADP,
    Site.UKG,
    Site.BREEZYHR,
    Site.COMEET,
    Site.PINPOINT,
    // Phase 8: ATS Expansion
    Site.MANATAL,
    Site.PAYLOCITY,
    Site.FRESHTEAM,
    Site.BULLHORN,
    Site.TRAKSTAR,
    Site.HIRINGTHING,
    Site.LOXO,
    Site.FOUNTAIN,
    Site.DEEL,
    Site.PHENOM,
    // Phase 10: ATS expansion
    Site.JOBYLON,
    Site.HOMERUN,
    // Phase 12: ATS expansion
    Site.JOBSCORE,
    Site.TALENTLYFT,
    // Phase 14: ATS expansion
    Site.CRELATE,
    Site.ISMARTRECRUIT,
    Site.RECRUITERFLOW,
  ]);

  /** Company scrapers target a single company's career API directly */
  private static readonly COMPANY_SITES = new Set<Site>([
    Site.AMAZON,
    Site.APPLE,
    Site.MICROSOFT,
    Site.NVIDIA,
    Site.TIKTOK,
    Site.UBER,
    Site.CURSOR,
    Site.GOOGLE_CAREERS,
    Site.META,
    Site.NETFLIX,
    Site.STRIPE,
    Site.OPENAI,
    // Phase 8: Company scrapers
    Site.IBM,
    Site.BOEING,
    Site.ZOOM,
  ]);

  /**
   * Orchestrates concurrent searching across selected sites.
   * Runs all selected source modules in parallel via Promise.allSettled.
   *
   * Routing rules (when no explicit siteType is provided):
   * - If `companySlug` provided → only ATS scrapers run (they need a slug)
   * - Otherwise → search + company scrapers run (ATS scrapers skipped)
   *
   * When `siteType` is explicitly provided, the filter is always respected
   * regardless of `companySlug`.
   */
  async searchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const explicitSites = input.siteType;
    let sites: Site[];

    if (explicitSites?.length) {
      // Explicit site selection — respect exactly what was requested
      sites = explicitSites;
    } else if (input.companySlug) {
      // companySlug provided but no explicit sites → ATS scrapers only
      sites = [...JobsService.ATS_SITES];
    } else {
      // Default: search + company scrapers (skip ATS — they need a slug)
      sites = Object.values(Site).filter(
        (s) => !JobsService.ATS_SITES.has(s),
      );
    }

    const selectedScrapers: { site: Site; scraper: IScraper }[] = [];

    for (const site of sites) {
      const scraper = this.scraperMap.get(site);
      if (scraper) {
        selectedScrapers.push({ site, scraper });
      } else {
        this.logger.warn(`Unknown site: ${site}`);
      }
    }

    if (selectedScrapers.length === 0) {
      this.logger.warn('No valid scrapers selected');
      return [];
    }

    this.logger.log(`Running ${selectedScrapers.length} scrapers concurrently: ${selectedScrapers.map((s) => s.site).join(', ')}`);

    // Run all scrapers concurrently using Promise.allSettled
    const results = await Promise.allSettled(
      selectedScrapers.map(async ({ site, scraper }) => {
        // Resolve retry policy for this source
        const globalRetry = this.configService.get('retry');
        const perSourceRetry = globalRetry.perSource?.[site] || {};
        
        const scraperInput = new ScraperInputDto({
          ...input,
          retries: input.retries ?? perSourceRetry.retries ?? globalRetry.defaultRetries,
          retryDelay: input.retryDelay ?? perSourceRetry.delayMs ?? globalRetry.defaultDelayMs,
          retryBackoff: input.retryBackoff ?? perSourceRetry.backoff ?? globalRetry.defaultBackoff,
          retryMaxDelay: input.retryMaxDelay ?? perSourceRetry.maxDelayMs ?? 30000,
        });

        this.logger.log(`Starting search for ${site} (retries=${scraperInput.retries}, backoff=${scraperInput.retryBackoff})`);
        const scraperStop = this.metrics.scraperDuration.startTimer({ site });
        try {
          const response = await scraper.scrape(scraperInput);
          scraperStop();
          this.metrics.scraperRequestsTotal.inc({ site, status: 'success' });
          // Tag each job with the site it came from
          for (const job of response.jobs) {
            job.site = site;
          }
          this.logger.log(`${site}: found ${response.jobs.length} jobs`);
          return response;
        } catch (err: any) {
          scraperStop();
          this.metrics.scraperRequestsTotal.inc({ site, status: 'error' });
          this.logger.error(`${site} search failed: ${err.message}`);
          throw err;
        }
      }),
    );

    // Aggregate results from fulfilled searches
    const allJobs: JobPostDto[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value.jobs);
      }
    }

    // Post-processing: salary enrichment (mirrors Python __init__.py logic)
    for (const job of allJobs) {
      this.postProcessSalary(job, input);
    }

    // Sort by site name then by date (most recent first)
    allJobs.sort((a, b) => {
      const siteCompare = (a.site ?? '').localeCompare(b.site ?? '');
      if (siteCompare !== 0) return siteCompare;

      const dateA = a.datePosted ? new Date(a.datePosted as string).getTime() : 0;
      const dateB = b.datePosted ? new Date(b.datePosted as string).getTime() : 0;
      return dateB - dateA;
    });

    this.logger.log(`Total aggregated jobs: ${allJobs.length}`);
    return allJobs;
  }

  /**
   * Post-processes a single job's salary data.
   * If the scraper provided direct compensation, optionally convert to annual.
   * If no compensation was returned and the country is USA, try to parse salary from the description.
   * This mirrors the orchestrator logic for salary post-processing.
   */
  private postProcessSalary(job: JobPostDto, input: ScraperInputDto): void {
    const enforceAnnual = input.enforceAnnualSalary ?? false;
    const country = input.country ?? Country.USA;

    if (job.compensation) {
      // Direct compensation from scraper
      job.salarySource = SalarySource.DIRECT_DATA;

      if (
        enforceAnnual &&
        job.compensation.interval &&
        job.compensation.interval !== 'yearly' &&
        job.compensation.minAmount != null &&
        job.compensation.maxAmount != null
      ) {
        const data = {
          interval: job.compensation.interval,
          minAmount: job.compensation.minAmount,
          maxAmount: job.compensation.maxAmount,
        };
        convertToAnnual(data);
        job.compensation.interval = data.interval as any;
        job.compensation.minAmount = data.minAmount;
        job.compensation.maxAmount = data.maxAmount;
      }
    } else if (country === Country.USA && job.description) {
      // Fallback: extract salary from description text (USA only)
      const extracted = extractSalary(job.description, {
        enforceAnnualSalary: enforceAnnual,
      });
      if (extracted.minAmount != null) {
        job.salarySource = SalarySource.DESCRIPTION;
        job.compensation = new CompensationDto({
          interval: extracted.interval as any,
          minAmount: extracted.minAmount,
          maxAmount: extracted.maxAmount,
          currency: extracted.currency ?? 'USD',
        });
      }
    }

    // Clear salary source if no salary data
    if (!job.compensation?.minAmount) {
      job.salarySource = undefined;
    }
  }

  /**
   * Dynamically register a new scraper (used by Plugin Architecture)
   */
  registerScraper(site: string, scraper: IScraper) {
    const siteKey = site.toLowerCase() as Site;
    this.scraperMap.set(siteKey, scraper);
    this.logger.log(`Registered custom scraper for: ${siteKey}`);
  }

  /**
   * List all currently registered source keys
   */
  listRegisteredSources(): string[] {
    return Array.from(this.scraperMap.keys());
  }
}

