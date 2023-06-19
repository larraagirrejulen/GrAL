<!-- @Route:/ -->
<Router basepath="{basepath}">
  <BaseLayout>
    <!-- Components are Pages or nested Routes -->
    <Route path="/"><OverviewPage /></Route>
    <Route path="/evaluation/*"><EvaluationRoute /></Route>

    <Route path="/login"><LoginPage /></Route>
    <Route path="/register"><RegisterPage /></Route>

    <!-- If anything else, it should hit an error? -->
    <Route path="/*"><OverviewPage /></Route>
    <Route path="/acknowledgements"><Acknowledgements /></Route>
  </BaseLayout>
</Router>
<!-- /@Route -->

<script>
  import { Router, Route } from 'svelte-navigator';

  import BaseLayout from '@app/components/layouts/BaseLayout.svelte';

  import EvaluationRoute from './EvaluationRoute.svelte';
  import Acknowledgements from '../pages/Acknowledgements.svelte';

  // Import pages
  import OverviewPage from '@app/components/pages/OverviewPage.svelte';

  import LoginPage from '@app/components/pages/LoginPage.svelte';
  import RegisterPage from '@app/components/pages/RegisterPage.svelte';

  export let basepath;
</script>
