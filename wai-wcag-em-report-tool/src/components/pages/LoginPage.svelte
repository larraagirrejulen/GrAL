<!--
 * @component
 *   OverviewPage
 * -->
<Page title="Login" pageid="login">
  
  <div>
    <div class="field">
      <label for="email">Email:</label>
      <input id="email" type="text" bind:value={email} />
    </div>
    <div class="field">
      <label for="password">Password:</label>
      <input id="password" type="password" bind:value={password} />
    </div>
    <div class='options'>
        <div class='leftDiv'>
          <Button on:click="{handleSubmit}">{"Login"}</Button>
        </div>
        <div class='rightDiv'>
          <Button on:click="{handleRegister}">{"Register"}</Button>
          <Button on:click="{handleCancel}">{"Cancel"}</Button>
        </div>
    </div>
  </div>

</Page>
<!-- /component -->

<script>
  import { useNavigate } from 'svelte-navigator';
  import Page from '@app/components/ui/Page.svelte';
  import Button from '@app/components/ui/Button.svelte';
  import { isLoggedIn, loggedUser } from '@app/stores/authStore.js';

  let email = '';
  let password = '';

  const navigate = useNavigate();

  async function handleSubmit() {

    if(email === "" || password === ""){
      alert("You must fill all input fields!!");
      return;
    }

    const bodyData = JSON.stringify({email, username: null, password});

    try{

      const loginResult = await fetchServer(bodyData, "userAuthentication");

      if(loginResult.success){
        window.alert("Succesfully loged");
        isLoggedIn.set(true);
        localStorage.setItem('isLoggedIn', 'true');
        loggedUser.set(loginResult.username);
        localStorage.setItem('loggedUser', loginResult.username);
        navigate("/", { replace: true });
      } else {
        window.alert(loginResult.error);
      }

    }catch(error){
      console.log(error);
    }
    
  }

  function handleRegister() {
    navigate("/register", { replace: true });
  }

  function handleCancel() {
    navigate("/", { replace: true });
  }

  export async function fetchServer(bodyData, action, timeout = 120000) {

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch('http://localhost:7070/' + action, {
          body: bodyData,
          method: "POST",
          headers: {"Content-Type": "application/json"},
          signal: controller.signal
      });
      
      clearTimeout(timer);

      if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
      
      const fetchData = await response.json();

      return JSON.parse(fetchData);

    } catch (error) {
        throw new Error("Error fetching scraping server => " + error.name === 'AbortError' ? 'fetch timed out!' : error.message)
    }

  }
</script>

<style>
  input {
    max-width: 40em;
  }
  .options{
    max-width: 40em;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .options .leftDiv{
      display: inline-flex;
  }

  .options .rightDiv{
    text-align: right;
  }
  .options .rightDiv :global(button){
    background-color: white;
    color: #005a6a;
  }

  .field {
    padding: 0;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .field label {
    display: block;
  }
  .field label {
    order: -1;
  }
  :global(.field input) {
    width: 100%;
  }
  :global(.field > *:not(:last-child)) {
    margin-bottom: 0.25em;
  }
</style>